/**
 * Controller for managing emails that belong to the authenticated user.
 *
 * @class EmailController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Email data-access model.
 */
export default function ({ id, model, stateModel, contactModel, sendEmail }) {
  function publicEmail(record) {
    if (!record) return record;
    const data = record.toJSON ? record.toJSON() : { ...record };
    const { smtpPassword, ...safeData } = data;
    return { ...safeData, ...(smtpPassword ? { hasSmtpPassword: true } : {}) };
  }

  function requestError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
  }

  async function getActiveState() {
    if (!stateModel) return undefined;

    return await stateModel.getOne({ name: "Activo", entity: "Email" })
      || await stateModel.save({
        name: "Activo",
        description: "El email está activo.",
        entity: "Email",
      });
  }

  /**
   * Delete an email by its ID.
   * @param {import('express').Request} req Express request containing the email ID.
    * @param {Object} config Controller configuration.
    * @param {string} config.id Controller identifier.
    * @param {import('owl-expressjs-utils').OwlModel} config.model - Email model instance.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async function deleteDataById(req, res) {
    try {
      const id = req.params.id;
      await model.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific email by its ID.
   * @param {import('express').Request} req Express request containing the email ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching email or an error response.
   */
  async function getDataById(req, res) {
    try {
      const id = req.params.id;
      const data = await model.getById(id);
      if (!data) {
        return res.status(404).json({ message: "Email not found." });
      }

      res.status(200).json(publicEmail(data));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by a specific contact.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async function getDataForContact(req, res) {
    try {
      const owner = req.params.id;
      const data = await model.getByCoincidence({
        owner,
        ownerType: "Contact",
      });
      res.json(data.map(publicEmail));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async function getDataForUser(req, res) {
    try {
      const owner = req.session.userId;
      const data = await model.getByCoincidence({
        owner,
        ownerType: "User",
      });
      res.json(data.map(publicEmail));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for a specific contact.
  * @param {import('express').Request} req Express request containing email data and the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async function registerForContact(req, res) {
    try {
      const owner = req.params.id;
      const activeState = await getActiveState();

      const newData = await model.save({
        email: req.body.email,
        ownerType: "Contact",
        owner,
        ...(activeState ? { state: activeState._id } : {}),
      });
      res.status(201).json(publicEmail(newData));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for the authenticated user.
   *
   * @param {import('express').Request} req Express request containing email data and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async function registerForUser(req, res) {
    try {
      const owner = req.session.userId;
      const existing = typeof model.getOne === "function"
        ? await model.getOne({ owner, ownerType: "User" })
        : null;
      if (existing) {
        return res.status(409).json({ message: "User already has an email." });
      }
      const activeState = await getActiveState();

      const newData = await model.save({
        email: req.body.email,
        ownerType: "User",
        owner,
        ...(activeState ? { state: activeState._id } : {}),
      });
      res.status(201).json(publicEmail(newData));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an email by its ID.
   * @param {import('express').Request} req Express request containing the email ID and updated data.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the updated email or an error response.
   */
  async function updateDataById(req, res) {
    try {
      const id = req.params.id;
      const updated = await model.update(id, { email: req.body.email });
      if (!updated) {
        return res.status(404).json({ message: "Email not found." });
      }
      res.status(200).json(publicEmail(updated));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async function configureSmtp(req, res) {
    try {
      const userId = req.session.userId;
      const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, smtpFromName } = req.body;
      const port = Number(smtpPort);
      const userEmail = await model.getOne({ owner: userId, ownerType: "User" });
      if (!userEmail) throw requestError("Register a sender email before configuring SMTP.", 409);
      if (!smtpHost?.trim() || !smtpUser?.trim() || !Number.isInteger(port) || port < 1 || port > 65535 || (!smtpPassword?.trim() && !userEmail.smtpPassword)) {
        throw requestError("SMTP host, port, username, and password are required.");
      }

      const updated = await model.update(userEmail._id, {
        smtpHost: smtpHost.trim(),
        smtpPort: port,
        smtpUser: smtpUser.trim(),
        ...(smtpPassword?.trim() ? { smtpPassword: smtpPassword.trim() } : {}),
        smtpSecure: Boolean(smtpSecure),
        ...(smtpFromName?.trim() ? { smtpFromName: smtpFromName.trim() } : {}),
      });
      return res.json(publicEmail(updated));
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  async function sendToContacts(req, res) {
    try {
      const userId = req.session.userId;
      const { contactIds, subject, text, html } = req.body;
      if (!Array.isArray(contactIds) || !contactIds.length) {
        throw requestError("Select at least one contact.");
      }
      if (!subject?.trim() || (!text?.trim() && !html?.trim())) {
        throw requestError("Subject and email content are required.");
      }

      const sender = await model.getOne({ owner: userId, ownerType: "User" });
      if (!sender?.smtpHost || !sender.smtpPassword) {
        throw requestError("Configure SMTP before sending email.", 409);
      }
      if (!contactModel || !sendEmail) {
        throw requestError("Email delivery is not configured.", 503);
      }

      const recipients = new Set();
      for (const contactId of new Set(contactIds.map(String))) {
        const contact = await contactModel.getById(contactId);
        if (!contact || String(contact.owner) !== String(userId)) {
          throw requestError("A selected contact does not belong to the user.", 403);
        }
        const contactEmails = await model.getByCoincidence({ owner: contactId, ownerType: "Contact" });
        for (const contactEmail of contactEmails) recipients.add(contactEmail.email);
      }
      if (!recipients.size) throw requestError("Selected contacts have no email addresses.");

      const result = await sendEmail(sender, {
        to: sender.email,
        bcc: [...recipients],
        subject: subject.trim(),
        ...(text?.trim() ? { text: text.trim() } : {}),
        ...(html?.trim() ? { html: html.trim() } : {}),
      });
      return res.status(202).json({ accepted: recipients.size, messageId: result?.messageId });
    } catch (error) {
      if (error.status) return res.status(error.status).json({ message: error.message });
      console.error("Email delivery failed:", error.message);
      return res.status(502).json({ message: "The email provider could not deliver the message." });
    }
  }

  return {
    deleteDataById,
    getDataById,
    getDataForContact,
    getDataForUser,
    registerForContact,
    registerForUser,
    updateDataById,
    configureSmtp,
    sendToContacts,
    getContactEmail: getDataForContact,
    registerUserEmail: registerForUser,
  };
}
