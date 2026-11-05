import { phoneError } from "../../utils/phoneNumber.js";

export default function ({ model, phoneModel }) {
  const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
  const userId = (req) => req.session?.userId || fail("Debes iniciar sesión.", 401);
  const text = (value, name) => typeof value === "string" && value.trim() ? value.trim() : fail(`${name} es obligatorio.`);
  const handle = (fn) => async (req, res) => {
    try { return await fn(req, res); } catch (error) { return phoneError(res, error); }
  };
  async function getOwnedPhone(owner, id) {
    if (typeof id !== "string" || !id) fail("Selecciona un teléfono.");
    const phone = await phoneModel.getById(id);
    if (!phone || String(phone.owner) !== String(owner) || phone.ownerType !== "User") {
      fail("The selected phone does not belong to the user.", 403);
    }
    return phone;
  }
  async function getOwnedToken(req) {
    const token = await model.getById(req.params.id);
    if (!token || String(token.owner) !== String(userId(req))) fail("Credenciales no encontradas.", 404);
    return token;
  }
  function safeToken(token) {
    if (!token) return null;
    return {
      _id: token._id, phone: token.phone,
      whatsappPhoneNumberId: token.whatsappPhoneNumberId,
      whatsappVersion: token.whatsappVersion,
      hasWhatsappToken: Boolean(typeof token.whatsappToken === "string" && token.whatsappToken.trim() &&
        /^v\d+\.\d+$/.test(token.whatsappVersion) && /^\d+$/.test(token.whatsappPhoneNumberId)),
      hasTelegramToken: Boolean(token.telegramBotToken),
    };
  }
  function whatsAppData(body) {
    const whatsappToken = text(body.whatsappToken, "Token de WhatsApp");
    const whatsappVersion = text(body.whatsappVersion, "Versión de WhatsApp");
    const whatsappPhoneNumberId = text(body.whatsappPhoneNumberId, "ID del número de WhatsApp");
    if (!/^v\d+\.\d+$/.test(whatsappVersion) || !/^\d+$/.test(whatsappPhoneNumberId)) {
      fail("La versión o el ID del número de WhatsApp no son válidos.");
    }
    return { whatsappToken, whatsappVersion, whatsappPhoneNumberId };
  }
  async function saveTokenForPhone(owner, phoneId, data, channel) {
    const phone = await getOwnedPhone(owner, phoneId);
    const current = await model.getOne({ owner, phone: phoneId });
    const saved = current
      ? await model.update(current._id, data, { runValidators: true })
      : await model.save({ ...data, owner, phone: phoneId });
    // Dotted updates preserve the other channel when configurations run concurrently.
    await phoneModel.update(phone._id, { [`tokens.${channel}`]: saved._id });
    return { saved, created: !current };
  }
  return {
    getForPhone: handle(async (req, res) => {
      const owner = userId(req);
      await getOwnedPhone(owner, req.params.phoneId);
      return res.json(safeToken(await model.getOne({ owner, phone: req.params.phoneId })));
    }),
    saveWhatsApp: handle(async (req, res) => {
      const { saved, created } = await saveTokenForPhone(userId(req), req.body.phone, whatsAppData(req.body), "whatsapp");
      return res.status(created ? 201 : 200).json(safeToken(saved));
    }),
    saveTelegram: handle(async (req, res) => {
      const data = { telegramBotToken: text(req.body.telegramBotToken, "Token de Telegram") };
      const { saved, created } = await saveTokenForPhone(userId(req), req.params.phoneId, data, "telegram");
      return res.status(created ? 201 : 200).json(safeToken(saved));
    }),
    getById: handle(async (req, res) => res.json(safeToken(await getOwnedToken(req)))),
    update: handle(async (req, res) => {
      const token = await getOwnedToken(req);
      const data = {};
      if (["whatsappToken", "whatsappVersion", "whatsappPhoneNumberId"].some((key) => key in req.body)) {
        Object.assign(data, whatsAppData({ whatsappToken: token.whatsappToken, whatsappVersion: token.whatsappVersion,
          whatsappPhoneNumberId: token.whatsappPhoneNumberId, ...req.body }));
      }
      if ("telegramBotToken" in req.body) data.telegramBotToken = text(req.body.telegramBotToken, "Token de Telegram");
      if (!Object.keys(data).length) fail("No hay credenciales para actualizar.");
      if (!token.phone) fail("Vincula las credenciales a un número desde tu perfil.", 409);
      await getOwnedPhone(userId(req), String(token.phone));
      return res.json(safeToken(await model.update(token._id, data, { runValidators: true })));
    }),
    delete: handle(async (req, res) => {
      const token = await getOwnedToken(req);
      if (token.phone) {
        const phone = await getOwnedPhone(userId(req), String(token.phone));
        const unset = {};
        for (const channel of ["whatsapp", "telegram"]) {
          if (String(phone.tokens?.[channel]) === String(token._id)) unset[`tokens.${channel}`] = 1;
        }
        if (Object.keys(unset).length) await phoneModel.update(phone._id, { $unset: unset });
      }
      await model.delete(token._id);
      return res.status(204).end();
    }),
  };
}
