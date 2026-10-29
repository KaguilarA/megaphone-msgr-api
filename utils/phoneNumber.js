/** Normalize display punctuation while preserving significant national leading zeroes. */
export function normalizePhoneNumber({ phone, countryNumber } = {}) {
  if (typeof phone !== "string" || typeof countryNumber !== "string") {
    throw Object.assign(new Error("El teléfono y el código de país deben ser texto."), { status: 400 });
  }
  phone = phone.replace(/[\s().-]/g, "");
  countryNumber = countryNumber.trim().replace(/^\+?/, "+");
  if (!/^\+[1-9]\d{0,2}$/.test(countryNumber) || !/^\d+$/.test(phone) ||
      !/^\+[1-9]\d{7,14}$/.test(countryNumber + phone)) {
    throw Object.assign(new Error("Ingresa un teléfono internacional válido, con el código de país separado."), { status: 400 });
  }
  return { phone, countryNumber, e164: countryNumber + phone };
}

export function phoneError(res, error) {
  const status = error.code === 11000 ? 409 : error.status ||
    (["CastError", "ValidationError"].includes(error.name) ? 400 : 500);
  return res.status(status).json({ message: status === 409 ? "Este número ya está registrado para este propietario." :
    status === 500 ? "No se pudo completar la operación." : error.message });
}
