/**
 * Testa SMTP do .env.local: node --env-file=.env.local scripts/test-smtp.mjs
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim();
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
const to =
  process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() ||
  user;

if (!host || !user || !pass) {
  console.error("Faltam SMTP_HOST, SMTP_USER ou SMTP_PASS no .env.local");
  process.exit(1);
}

const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
const secure =
  process.env.SMTP_SECURE === "true" ||
  (port === 465 && process.env.SMTP_SECURE !== "false");

const transport = nodemailer.createTransport({
  host,
  port: Number.isNaN(port) ? 587 : port,
  secure,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log("✓ Conexão SMTP OK");

  const from =
    process.env.SMTP_FROM?.trim() || `AMOPARK <${user}>`;

  await transport.sendMail({
    from,
    to,
    subject: "[AMOPARK] Teste de e-mail do site",
    text: "Se você recebeu isto, o Nodemailer está configurado corretamente.",
    html: "<p>Se você recebeu isto, o <strong>Nodemailer</strong> está configurado corretamente.</p>",
  });

  console.log(`✓ E-mail de teste enviado para ${to}`);
} catch (err) {
  console.error("✗ Falha:", err instanceof Error ? err.message : err);
  process.exit(1);
}
