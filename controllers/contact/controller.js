import { normalizePhoneNumber } from "../../utils/phoneNumber.js";
import { normalizeImportedPhone, parseContactImport } from "../../utils/contactImport.js";

const MAX_IMPORT_ROWS = 1000;

export default function ({ id, model, stateModel, phoneNumberModel }) {
  async function getActiveState() {
    if (!stateModel) return undefined;

    return (
      (await stateModel.getOne({ name: "Activo", entity: id })) ||
      (await stateModel.save({
        name: "Activo",
        description: "El contacto está activo.",
        entity: id,
      }))
    );
  }

  /**
   * Delete a contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async function deleteById(req, res) {
    try {
      const contactId = req.params.id;
      const contact = await model.getById(contactId);
      if (!contact || String(contact.owner) !== String(req.session.userId)) {
        return res.status(404).json({ message: "Contact not found." });
      }
      if (phoneNumberModel) {
        const phones = await phoneNumberModel.getByCoincidence({
          owner: contactId,
          ownerType: "Contact",
        });
        for (const phone of phones) await phoneNumberModel.delete(phone._id);
      }
      await model.delete(contactId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all contacts owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the authenticated user.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching contacts or an error response.
   */
  async function getAll(req, res) {
    try {
      const userId = req.session?.userId;
      const contacts = await model.getByCoincidence(
        {
          owner: userId,
        },
        {
          populate: ['state'],
        },
      );
      if (!phoneNumberModel || !contacts.length) {
        return res.status(200).json(contacts);
      }
      const phones = await phoneNumberModel.getByCoincidence({
        ownerType: "Contact",
        owner: { $in: contacts.map((contact) => contact._id) },
      });
      const phonesByContact = new Map();
      for (const phone of phones) {
        const key = String(phone.owner);
        phonesByContact.set(key, [...(phonesByContact.get(key) || []), phone]);
      }
      return res.status(200).json(contacts.map((contact) => ({
        ...(typeof contact.toObject === "function" ? contact.toObject() : contact),
        phoneNumbers: phonesByContact.get(String(contact._id)) || [],
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific contact by its ID.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching contact or an error response.
   */
  async function getById(req, res) {
    try {
      const contactId = req.params.id;
      const contact = await model.getById(contactId);
      if (!contact || String(contact.owner) !== String(req.session.userId)) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a contact for the authenticated user.
   * @param {import('express').Request} req Express request containing contact data and the authenticated user.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created contact or an error response.
   */
  async function register(req, res) {
    let contact;
    const savedPhones = [];
    try {
      const userId = req.session?.userId;
      const body = req.body || {};
      if (!Array.isArray(body.phoneNumbers) || body.phoneNumbers.length === 0) {
        return res.status(400).json({ error: "Agrega al menos un número de teléfono." });
      }
      if (!phoneNumberModel) {
        return res.status(500).json({ error: "Phone number storage is not configured." });
      }
      const normalizedPhones = body.phoneNumbers.map((phone) => {
        if (!phone || typeof phone !== "object" || Array.isArray(phone)) {
          throw Object.assign(new Error("Cada teléfono debe incluir número y código de país."), { status: 400 });
        }
        return normalizePhoneNumber(phone);
      });
      if (new Set(normalizedPhones.map((phone) => phone.e164)).size !== normalizedPhones.length) {
        return res.status(400).json({ error: "No repitas números de teléfono en el contacto." });
      }
      if (body.name !== undefined && typeof body.name !== "string") {
        return res.status(400).json({ error: "El nombre del contacto debe ser texto." });
      }
      const { name } = body;
      const contactData = { owner: userId, ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}) };
      const activeState = await getActiveState();
      if (activeState?._id) contactData.state = activeState._id;
      contact = await model.save(contactData);
      const phoneState = stateModel && (
        await stateModel.getOne({ name: "active", entity: "Phone" }) ||
        await stateModel.save({ name: "active", entity: "Phone", description: "Phone number is active." })
      );
      for (const phone of normalizedPhones) {
        savedPhones.push(await phoneNumberModel.save({
          ...phone,
          owner: contact._id,
          ownerType: "Contact",
          ...(phoneState ? { state: [phoneState._id] } : {}),
        }));
      }
      return res.status(201).json({
        ...(typeof contact.toObject === "function" ? contact.toObject() : contact),
        phoneNumbers: savedPhones,
      });
    } catch (error) {
      try {
        for (const phone of savedPhones) await phoneNumberModel.delete(phone._id);
        if (contact) await model.delete(contact._id);
      } catch (rollbackError) {
        console.error("Contact creation rollback failed:", rollbackError.message);
      }
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async function importContacts(req, res) {
    const created = [];
    try {
      const userId = req.session?.userId;
      const countryNumber = req.body?.countryNumber;
      if (typeof countryNumber !== "string" || !/^\+[1-9]\d{0,2}$/.test(countryNumber)) {
        return res.status(400).json({ error: "Selecciona un código de país válido." });
      }
      if (!phoneNumberModel) {
        return res.status(500).json({ error: "Phone number storage is not configured." });
      }
      const rows = await parseContactImport(req.file);
      if (rows.length > MAX_IMPORT_ROWS) {
        return res.status(413).json({ error: `Se permiten hasta ${MAX_IMPORT_ROWS} números por archivo.` });
      }

      const numbers = [];
      const invalidRows = [];
      const seenNumbers = new Set();
      let duplicateCount = 0;
      for (const { row, value } of rows) {
        try {
          const number = normalizeImportedPhone(value, countryNumber);
          if (seenNumbers.has(number.e164)) {
            duplicateCount += 1;
            continue;
          }
          seenNumbers.add(number.e164);
          numbers.push({ ...number, row });
        } catch {
          invalidRows.push(row);
        }
      }

      const existingContacts = await model.getByCoincidence({ owner: userId });
      const existingPhones = existingContacts.length
        ? await phoneNumberModel.getByCoincidence({
            ownerType: "Contact",
            owner: { $in: existingContacts.map((contact) => contact._id) },
          })
        : [];
      const existingNumbers = new Set();
      for (const phone of existingPhones) {
        try {
          existingNumbers.add(phone.e164 || normalizePhoneNumber(phone).e164);
        } catch {
          console.error("Skipping a malformed existing contact phone during import.");
        }
      }

      const uniqueNumbers = numbers.filter(({ e164 }) => {
        if (!existingNumbers.has(e164)) return true;
        duplicateCount += 1;
        return false;
      });
      const activeState = await getActiveState();
      const phoneState = stateModel && (
        await stateModel.getOne({ name: "active", entity: "Phone" }) ||
        await stateModel.save({ name: "active", entity: "Phone", description: "Phone number is active." })
      );

      for (const number of uniqueNumbers) {
        const contact = await model.save({
          owner: userId,
          ...(activeState?._id ? { state: activeState._id } : {}),
        });
        try {
          const phone = await phoneNumberModel.save({
            phone: number.phone,
            countryNumber: number.countryNumber,
            e164: number.e164,
            owner: contact._id,
            ownerType: "Contact",
            ...(phoneState ? { state: [phoneState._id] } : {}),
          });
          created.push({ contactId: contact._id, phoneId: phone._id });
        } catch (error) {
          await model.delete(contact._id);
          throw error;
        }
      }

      return res.status(201).json({
        createdCount: created.length,
        duplicateCount,
        invalidCount: invalidRows.length,
        invalidRows: invalidRows.slice(0, 20),
      });
    } catch (error) {
      try {
        for (const item of created) {
          await phoneNumberModel.delete(item.phoneId);
          await model.delete(item.contactId);
        }
      } catch (rollbackError) {
        console.error("Contact import rollback failed:", rollbackError.message);
      }
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  /**
   * Update a contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated contact or an error response.
   */
  async function updateById(req, res) {
    try {
      const contactId = req.params.id;
      const contact = await model.getById(contactId);
      if (!contact || String(contact.owner) !== String(req.session.userId)) {
        return res.status(404).json({ message: "Contact not found." });
      }
      const { owner: _owner, ...updatedData } = req.body;
      const updatedContact = await model.update(contactId, updatedData);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  return {
    deleteById,
    getAll,
    getById,
    importContacts,
    register,
    updateById,
  };
}
