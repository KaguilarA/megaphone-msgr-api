import nodemailer from "nodemailer";

export async function sendEmail(
  smtpConfig,
  { to, bcc, subject, text, html },
  { createTransport = nodemailer.createTransport } = {},
) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, email, smtpFromName } = smtpConfig || {};
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !email) {
    throw new Error("A complete SMTP configuration is required to send email.");
  }
  if ((!to && !bcc?.length) || !subject || (!text && !html)) {
    throw new TypeError("Recipient, subject, and message content are required.");
  }

  const transporter = createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Boolean(smtpSecure),
    auth: { user: smtpUser, pass: smtpPassword },
  });

  return transporter.sendMail({
    from: smtpFromName ? { name: smtpFromName, address: email } : email,
    to,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
    ...(bcc?.length ? { bcc } : {}),
  });
}
