import { normalizePhoneNumber, phoneError } from "../../utils/phoneNumber.js";

/** Phone ownership is always resolved from the session or an owned contact. */
export default function ({ model, stateModel, contactModel, tokenModel }) {
  const fail = (message, status) => { throw Object.assign(new Error(message), { status }); };
  function userId(req) {
    return req.session?.userId || fail("Debes iniciar sesión.", 401);
  }
  async function ownedContact(req, id) {
    const owner = userId(req);
    const contact = await contactModel.getById(id);
    if (!contact || String(contact.owner?._id || contact.owner) !== String(owner)) {
      fail("Contacto no encontrado.", 404);
    }
  }
  async function ownedPhone(req) {
    const owner = userId(req);
    const phone = await model.getById(req.params.id);
    if (!phone) fail("Teléfono no encontrado.", 404);
    if (phone.ownerType === "Contact") await ownedContact(req, phone.owner);
    else if (phone.ownerType !== "User" || String(phone.owner?._id || phone.owner) !== String(owner)) {
      fail("Teléfono no encontrado.", 404);
    }
    return phone;
  }
  const handle = (fn) => async (req, res) => {
    try { return await fn(req, res); } catch (error) { return phoneError(res, error); }
  };
  async function assertUnique(owner, ownerType, data, id) {
    const matches = await model.getByCoincidence({ owner, ownerType });
    if (matches.some((phone) => {
      if (String(phone._id) === String(id)) return false;
      try { return normalizePhoneNumber(phone).e164 === data.e164; } catch { return false; }
    })) fail("Este número ya está registrado para este propietario.", 409);
  }
  const register = (ownerType) => handle(async (req, res) => {
    const owner = ownerType === "User" ? userId(req) : req.params.id;
    if (ownerType === "Contact") await ownedContact(req, owner);
    const data = normalizePhoneNumber(req.body);
    await assertUnique(owner, ownerType, data);
    const state = stateModel && (await stateModel.getOne({ name: "active", entity: "Phone" }) ||
      await stateModel.save({ name: "active", entity: "Phone", description: "Phone number is active." }));
    const saved = await model.save({ ...data, owner, ownerType, ...(state ? { state: [state._id] } : {}) });
    return res.status(201).json(saved);
  });
  const registerForUser = register("User");
  const registerForContact = register("Contact");
  const getDataForContact = handle(async (req, res) => {
    await ownedContact(req, req.params.id);
    return res.json(await model.getByCoincidence({ owner: req.params.id, ownerType: "Contact" }));
  });
  return {
    registerForUser,
    registerForContact,
    registerUserPhoneNumber: registerForUser,
    getContactPhoneNumber: getDataForContact,
    getDataForContact,
    getDataForUser: handle(async (req, res) => res.json(await model.getByCoincidence({ owner: userId(req), ownerType: "User" }))),
    getDataById: handle(async (req, res) => res.json(await ownedPhone(req))),
    updateDataById: handle(async (req, res) => {
      const phone = await ownedPhone(req);
      const data = normalizePhoneNumber({ phone: req.body.phone ?? phone.phone, countryNumber: req.body.countryNumber ?? phone.countryNumber });
      await assertUnique(phone.owner, phone.ownerType, data, phone._id);
      const identityChanged = normalizePhoneNumber(phone).e164 !== data.e164;
      const configured = phone.tokens?.whatsapp || phone.tokens?.telegram ||
        (identityChanged && phone.ownerType === "User" && tokenModel && await tokenModel.getOne({ owner: userId(req), phone: phone._id }));
      if (phone.ownerType === "User" && configured && identityChanged) {
        fail("Agrega otro número y configura sus credenciales antes de reemplazar este teléfono.", 409);
      }
      return res.json(await model.update(phone._id, data, { runValidators: true }));
    }),
    deleteDataById: handle(async (req, res) => {
      const phone = await ownedPhone(req);
      if (phone.ownerType === "User" && tokenModel) {
        const tokens = await tokenModel.getByCoincidence({ owner: userId(req), phone: phone._id });
        for (const token of tokens) await tokenModel.delete(token._id);
      }
      await model.delete(phone._id);
      return res.status(204).end();
    }),
  };
}
