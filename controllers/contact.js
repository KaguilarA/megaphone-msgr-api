import { OwlController } from "owl-expressjs-utils";

const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

// batches the email/phoneNumber/address lookup for one or many contacts into 3 queries total (avoids N+1)
async function attachChildren(contacts, emailModel, phoneNumberModel, addressModel) {
  const list = Array.isArray(contacts) ? contacts : [contacts];
  const ids = list.filter(Boolean).map((contact) => contact._id);

  if (ids.length === 0) return contacts;

  const [emails, phoneNumbers, addresses] = await Promise.all([
    emailModel?.getByCoincidence({ owner: { $in: ids }, ownerType: "Contact" }) ?? [],
    phoneNumberModel?.getByCoincidence({ owner: { $in: ids }, ownerType: "Contact" }) ?? [],
    addressModel?.getByCoincidence({ owner: { $in: ids }, ownerType: "Contact" }) ?? [],
  ]);

  const groupByOwner = (docs) => {
    const map = new Map();
    for (const doc of docs) {
      const key = String(doc.owner);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(doc);
    }
    return map;
  };

  const emailsByOwner = groupByOwner(emails);
  const phoneNumbersByOwner = groupByOwner(phoneNumbers);
  const addressesByOwner = groupByOwner(addresses);

  const withChildren = list.map((contact) => {
    if (!contact) return contact;
    const key = String(contact._id);
    return {
      ...toPlain(contact),
      emails: emailsByOwner.get(key) ?? [],
      phoneNumbers: phoneNumbersByOwner.get(key) ?? [],
      addresses: addressesByOwner.get(key) ?? [],
    };
  });

  return Array.isArray(contacts) ? withChildren : withChildren[0];
}

export default ({
  entityId = "Contact",
  model,
  populatedFields = [],
  emailModel,
  phoneNumberModel,
  addressModel,
}) => {
  const genericController = OwlController({ entityId, model, populatedFields });

  async function register(req, res) {
    try {
      const { emails, phoneNumbers, addresses, ...contactFields } = req.body;

      // owner always comes from the session, never from the client payload
      const newContact = await model.save({
        ...contactFields,
        owner: req.session.userId,
      });

      try {
        const [emailDocs, phoneNumberDocs, addressDocs] = await Promise.all([
          Promise.all(
            (emails ?? []).map((email) =>
              emailModel.save({ email, owner: newContact._id, ownerType: "Contact" }),
            ),
          ),
          Promise.all(
            (phoneNumbers ?? []).map((phoneNumber) =>
              phoneNumberModel.save({
                ...phoneNumber,
                owner: newContact._id,
                ownerType: "Contact",
              }),
            ),
          ),
          Promise.all(
            (addresses ?? []).map((address) =>
              addressModel.save({ ...address, owner: newContact._id, ownerType: "Contact" }),
            ),
          ),
        ]);

        res.status(201).json({
          ...toPlain(newContact),
          emails: emailDocs,
          phoneNumbers: phoneNumberDocs,
          addresses: addressDocs,
        });
      } catch (linkError) {
        // avoid an orphaned contact document when email/phoneNumber/address creation fails
        await model.delete(newContact._id);
        throw linkError;
      }
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error.message,
      });
    }
  }

  async function getAll(req, res) {
    try {
      const contacts = await model.getByCoincidence({ owner: req.session.userId });
      res.json(contacts);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error.message || error,
      });
    }
  }

  // scope reads/writes/deletes to contacts owned by the requesting user to prevent IDOR
  async function getById(req, res) {
    try {
      const contact = await model.getOne(
        { _id: req.params.id, owner: req.session.userId },
        { populate: populatedFields },
      );

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const withChildren = await attachChildren(contact, emailModel, phoneNumberModel, addressModel);
      res.json(withChildren);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error.`,
        error: error.message || error,
      });
    }
  }

  async function update(req, res) {
    try {
      const contact = await model.getOne({
        _id: req.params.id,
        owner: req.session.userId,
      });

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const updatedData = await model.update(req.params.id, req.body, {
        populate: populatedFields,
      });

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error.message || error,
      });
    }
  }

  async function deleteContact(req, res) {
    try {
      const contact = await model.getOne({
        _id: req.params.id,
        owner: req.session.userId,
      });

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const [emails, phoneNumbers, addresses] = await Promise.all([
        emailModel?.getByCoincidence({ owner: contact._id, ownerType: "Contact" }) ?? [],
        phoneNumberModel?.getByCoincidence({ owner: contact._id, ownerType: "Contact" }) ?? [],
        addressModel?.getByCoincidence({ owner: contact._id, ownerType: "Contact" }) ?? [],
      ]);

      // cascade delete so the referenced children never outlive their owning contact
      await Promise.all([
        ...emails.map((email) => emailModel.delete(email._id)),
        ...phoneNumbers.map((phoneNumber) => phoneNumberModel.delete(phoneNumber._id)),
        ...addresses.map((address) => addressModel.delete(address._id)),
        model.delete(req.params.id),
      ]);

      res.json(contact);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error delete.`,
        error: error.message || error,
      });
    }
  }

  return {
    ...genericController,
    register,
    getAll,
    getById,
    update,
    delete: deleteContact,
  };
};
