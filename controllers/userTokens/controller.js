import { phoneError } from "../../utils/phoneNumber.js";
import {
  getWhatsAppConnectionStatus,
  startWhatsAppConnection,
} from "../../integrations/whatsapp.js";

export default function ({
  model,
  phoneModel,
  whatsappConfig = {},
  whatsappFetch = fetch,
}) {
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
      hasWhatsAppConnection: Boolean(token.whatsappSession),
      whatsappPhoneNumberId: token.whatsappPhoneNumberId,
      whatsappVersion: token.whatsappVersion,
      hasWhatsappToken: Boolean(typeof token.whatsappToken === "string" && token.whatsappToken.trim() &&
        /^v\d+\.\d+$/.test(token.whatsappVersion) && /^\d+$/.test(token.whatsappPhoneNumberId)),
      hasTelegramToken: Boolean(token.telegramBotToken),
    };
  }
  function whatsAppSessionData(body) {
    const whatsappSession = text(body.whatsappSession, "Sesión de WAHA");
    if (!/^[a-zA-Z0-9._-]{1,64}$/.test(whatsappSession)) {
      fail("El nombre de sesión de WAHA no es válido.");
    }
    return { whatsappSession };
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
  async function getPhoneConnection(owner, phone) {
    const current = await model.getOne({ owner, phone: phone._id });
    const whatsappSession = current?.whatsappSession || `m-${String(phone._id)}`;
    if (!/^[a-zA-Z0-9._-]{1,64}$/.test(whatsappSession)) {
      fail("No se pudo preparar la conexión de WhatsApp para este número.", 400);
    }
    const existing = await model.getOne({ whatsappSession });
    if (existing && String(existing.phone) !== String(phone._id)) {
      fail("Esta conexión ya está asociada a otro número.", 409);
    }
    return { current, whatsappSession };
  }
  async function persistWhatsAppConnection(owner, phone, current, whatsappSession) {
    if (current?.whatsappSession === whatsappSession) return current;
    try {
      const { saved } = await saveTokenForPhone(
        owner,
        String(phone._id),
        { whatsappSession },
        "whatsapp",
      );
      return saved;
    } catch (error) {
      if (error.code === 11000) {
        const saved = await model.getOne({ owner, phone: phone._id });
        if (saved?.whatsappSession === whatsappSession) return saved;
      }
      throw error;
    }
  }
  async function whatsappConnection(req, start) {
    const owner = userId(req);
    const phone = await getOwnedPhone(owner, req.params.phoneId);
    if (!whatsappConfig.apiBaseUrl || !whatsappConfig.apiKey) {
      fail("La conexión de WhatsApp no está disponible en este momento.", 503);
    }
    const { current, whatsappSession } = await getPhoneConnection(owner, phone);
    const sessionToken = { whatsappSession };
    const sourcePhoneNumber = `${phone.countryNumber}${phone.phone}`;
    let connection;
    try {
      const options = { ...whatsappConfig, fetchImpl: whatsappFetch };
      connection = start
        ? await startWhatsAppConnection(sessionToken, sourcePhoneNumber, {
            ...options,
            restartWrongNumber: true,
          })
        : await getWhatsAppConnectionStatus(sessionToken, sourcePhoneNumber, options);
    } catch (error) {
      if (Number.isInteger(error.providerStatus) && error.providerOperation) {
        console.error("WhatsApp connection service returned an error:", {
          operation: error.providerOperation,
          status: error.providerStatus,
        });
      }
      if (error.providerRejected) {
        fail(
          `No se pudo completar la conexión de WhatsApp. Código del servicio: ${error.providerStatus}.`,
          502,
        );
      }
      if (Number.isInteger(error.providerStatus) && error.providerStatus >= 500) {
        fail(
          `El servicio de WhatsApp no está disponible. Código del servicio: ${error.providerStatus}.`,
          503,
        );
      }
      throw error;
    }
    if (connection.status === "connected") {
      await persistWhatsAppConnection(owner, phone, current, whatsappSession);
    }
    return connection;
  }
  return {
    getForPhone: handle(async (req, res) => {
      const owner = userId(req);
      await getOwnedPhone(owner, req.params.phoneId);
      return res.json(safeToken(await model.getOne({ owner, phone: req.params.phoneId })));
    }),
    saveWhatsApp: handle(async (req, res) => {
      const owner = userId(req);
      const data = whatsAppSessionData(req.body);
      const phone = await getOwnedPhone(owner, req.body.phone);
      const existing = await model.getOne({ whatsappSession: data.whatsappSession });
      if (existing && String(existing.phone) !== String(phone._id)) {
        fail("Esta sesión de WAHA ya está vinculada a otro teléfono.", 409);
      }
      const { saved, created } = await saveTokenForPhone(owner, phone._id, data, "whatsapp");
      return res.status(created ? 201 : 200).json(safeToken(saved));
    }),
    getWhatsAppConnection: handle(async (req, res) =>
      res.json(await whatsappConnection(req, false)),
    ),
    startWhatsAppConnection: handle(async (req, res) =>
      res.json(await whatsappConnection(req, true)),
    ),
    saveTelegram: handle(async (req, res) => {
      const data = { telegramBotToken: text(req.body.telegramBotToken, "Token de Telegram") };
      const { saved, created } = await saveTokenForPhone(userId(req), req.params.phoneId, data, "telegram");
      return res.status(created ? 201 : 200).json(safeToken(saved));
    }),
    getById: handle(async (req, res) => res.json(safeToken(await getOwnedToken(req)))),
    update: handle(async (req, res) => {
      const token = await getOwnedToken(req);
      const data = {};
      if ("whatsappSession" in req.body) Object.assign(data, whatsAppSessionData(req.body));
      if ("telegramBotToken" in req.body) data.telegramBotToken = text(req.body.telegramBotToken, "Token de Telegram");
      if (!Object.keys(data).length) fail("No hay credenciales para actualizar.");
      if (!token.phone) fail("Vincula las credenciales a un número desde tu perfil.", 409);
      await getOwnedPhone(userId(req), String(token.phone));
      if (data.whatsappSession) {
        const existing = await model.getOne({ whatsappSession: data.whatsappSession });
        if (existing && String(existing._id) !== String(token._id)) {
          fail("Esta sesión de WAHA ya está vinculada a otro teléfono.", 409);
        }
      }
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
