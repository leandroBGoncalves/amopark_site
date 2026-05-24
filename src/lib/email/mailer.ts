import nodemailer from "nodemailer";

let transport: nodemailer.Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS
  );
}

function getTransport(): nodemailer.Transporter {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP não configurado.");
  }
  if (!transport) {
    const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
    const secure =
      process.env.SMTP_SECURE === "true" || (port === 465 && process.env.SMTP_SECURE !== "false");
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port: Number.isNaN(port) ? 587 : port,
      secure,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        // Gmail exibe a senha de app em blocos de 4 caracteres; remove espaços.
        pass: process.env.SMTP_PASS!.replace(/\s/g, ""),
      },
    });
  }
  return transport;
}

export function getSmtpFromAddress(): string {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  return `AMOPARK <${process.env.SMTP_USER!.trim()}>`;
}

export function getSiteBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Retorna false se SMTP não estiver configurado (inscrição no site continua válida). */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[email] SMTP não configurado — e-mail não enviado:", params.subject);
    return false;
  }

  await getTransport().sendMail({
    from: getSmtpFromAddress(),
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  return true;
}
