import { readSheet } from "read-excel-file/node";
import { countries } from "country-codes-flags-phone-codes";
import { normalizePhoneNumber } from "./phoneNumber.js";
import type { ContactImportRow, NormalizedPhoneNumber } from "../types/domain.js";

const HEADER_NAMES = new Set([
  "phone",
  "phonenumber",
  "mobile",
  "mobilenumber",
  "telefono",
  "telefonos",
  "numerodetelefono",
  "celular",
  "number",
]);
const DIAL_CODES = [...new Set(countries.map((country) => country.dialCode).filter(Boolean))]
  .sort((a, b) => b.length - a.length);

function importError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isBlank(value) {
  return value === null || value === undefined || value === "";
}

function parseCsv(text) {
  const rows = [];
  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\n|\r/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (/[,;\t]/.test(line)) {
      throw importError("El CSV debe contener una sola columna de teléfonos.");
    }
    let value = line;
    if (value.startsWith('"')) {
      if (!value.endsWith('"') || value.length < 2) {
        throw importError(`El CSV tiene comillas inválidas en la fila ${index + 1}.`);
      }
      value = value.slice(1, -1).replace(/""/g, '"');
    } else if (value.includes('"')) {
      throw importError(`El CSV tiene comillas inválidas en la fila ${index + 1}.`);
    }
    rows.push({ row: index + 1, value });
  }
  return rows;
}

function parseJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw importError("El archivo JSON no tiene un formato válido.");
  }
  const values = Array.isArray(data) ? data : data?.phoneNumbers;
  if (!Array.isArray(values)) {
    throw importError("El JSON debe ser una lista de teléfonos o incluir la propiedad phoneNumbers.");
  }
  return values.map((value, index) => ({ row: index + 1, value }));
}

async function parseExcel(buffer) {
  let sheetRows;
  try {
    sheetRows = await readSheet(buffer);
  } catch {
    throw importError("No se pudo leer el archivo Excel. Guarda el documento como .xlsx e inténtalo de nuevo.");
  }
  const rows = [];
  for (const [index, sheetRow] of sheetRows.entries()) {
    const cells = sheetRow
      .map((value, columnNumber) => ({ columnNumber, value }))
      .filter(({ value }) => !isBlank(value));
    if (!cells.length) continue;
    if (cells.length !== 1 || cells[0].columnNumber !== 0) {
      throw importError(`La hoja Excel debe tener una sola columna de teléfonos (fila ${index + 1}).`);
    }
    rows.push({ row: index + 1, value: cells[0].value });
  }
  return rows;
}

function isHeader(value) {
  return typeof value === "string" &&
    HEADER_NAMES.has(value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase().replace(/[\s_-]/g, ""));
}

export async function parseContactImport(
  file: { buffer?: Buffer; originalname?: string } | undefined,
): Promise<ContactImportRow[]> {
  if (!file?.buffer || typeof file.originalname !== "string") {
    throw importError("Selecciona un archivo CSV, JSON o Excel (.xlsx).");
  }
  const extension = file.originalname.split(".").pop()?.toLowerCase();
  const text = () => file.buffer.toString("utf8");
  let rows;
  if (extension === "csv") rows = parseCsv(text());
  else if (extension === "json") rows = parseJson(text());
  else if (extension === "xlsx") rows = await parseExcel(file.buffer);
  else throw importError("Solo se permiten archivos CSV, JSON o Excel .xlsx.");

  if (rows.length && isHeader(rows[0].value)) rows.shift();
  if (!rows.length) throw importError("El archivo no contiene números de teléfono.");
  return rows;
}

export function normalizeImportedPhone(
  value: unknown,
  defaultCountryNumber: string,
): NormalizedPhoneNumber {
  if (!DIAL_CODES.includes(defaultCountryNumber)) {
    throw importError("Selecciona un código de país válido.");
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw importError("El número debe estar escrito como texto para conservar sus dígitos.");
    }
    value = String(value);
  }
  if (typeof value !== "string" || !value.trim()) {
    throw importError("La celda debe contener un número de teléfono.");
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    const normalized = trimmed.replace(/[\s().-]/g, "");
    const dialCode = DIAL_CODES.find((code) => normalized.startsWith(code));
    if (!dialCode) throw importError("El número internacional tiene un código de país inválido.");
    return normalizePhoneNumber({
      phone: normalized.slice(dialCode.length),
      countryNumber: dialCode,
    });
  }
  return normalizePhoneNumber({ phone: trimmed, countryNumber: defaultCountryNumber });
}
