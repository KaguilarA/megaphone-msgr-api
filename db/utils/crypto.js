import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

if (SECRET_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY debe ser un string hexadecimal de 64 caracteres (32 bytes).');
}

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // IV de 12 bytes para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData) {
  const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('Formato de texto encriptado inválido.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function isEncrypted(val) {
  if (typeof val !== "string") return false;
  const parts = val.split(":");
  return parts.length === 3 && parts[0].length === 24 && parts[1].length === 32;
};