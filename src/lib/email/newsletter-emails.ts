import { getSiteBaseUrl, sendEmail } from "./mailer";
import { siteConfig } from "@/lib/utils";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:system-ui,-apple-system,sans-serif;color:#2d3748;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <tr><td style="background:linear-gradient(135deg,#1e5a8e,#5b3d8a);padding:20px 24px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">${escapeHtml(siteConfig.name)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.85);">${escapeHtml(siteConfig.fullName)}</p>
        </td></tr>
        <tr><td style="padding:24px;">${content}</td></tr>
        <tr><td style="padding:16px 24px;background:#f8f9fa;font-size:11px;color:#718096;text-align:center;">
          ${escapeHtml(siteConfig.slogan)} · North Park
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletterWelcomeEmail(params: {
  email: string;
  nome: string | null;
}): Promise<boolean> {
  const siteUrl = getSiteBaseUrl();
  const greeting = params.nome
    ? `Olá, ${escapeHtml(params.nome)}!`
    : "Olá!";

  const html = layout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greeting}</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      Sua inscrição na newsletter da <strong>AMOPARK</strong> foi confirmada. A partir de agora você
      receberá novidades sobre ofícios, eventos e conquistas do North Park.
    </p>
    <p style="margin:0 0 20px;line-height:1.6;font-size:14px;">
      Enquanto isso, acompanhe o mural de transparência e o calendário no site:
    </p>
    <p style="margin:0 0 8px;">
      <a href="${siteUrl}/oficios" style="color:#1e5a8e;font-weight:600;">Ver ofícios</a>
      ·
      <a href="${siteUrl}/eventos" style="color:#1e5a8e;font-weight:600;">Ver eventos</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#718096;line-height:1.5;">
      Se não foi você quem se inscreveu, ignore este e-mail.
    </p>
  `);

  const text = [
    params.nome ? `Olá, ${params.nome}!` : "Olá!",
    "",
    "Sua inscrição na newsletter da AMOPARK foi confirmada.",
    `Ofícios: ${siteUrl}/oficios`,
    `Eventos: ${siteUrl}/eventos`,
    "",
    "Se não foi você quem se inscreveu, ignore este e-mail.",
  ].join("\n");

  return sendEmail({
    to: params.email,
    subject: `Bem-vindo(a) à newsletter ${siteConfig.name}`,
    html,
    text,
  });
}

export async function sendNewsletterAdminNotifyEmail(params: {
  email: string;
  nome: string | null;
  origem: string;
}): Promise<boolean> {
  const notifyTo =
    process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim();
  if (!notifyTo) {
    console.warn("[email] NEWSLETTER_NOTIFY_EMAIL não definido — aviso à diretoria omitido.");
    return false;
  }

  const siteUrl = getSiteBaseUrl();
  const nomeLine = params.nome
    ? `<strong>Nome:</strong> ${escapeHtml(params.nome)}<br>`
    : "";

  const html = layout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">Nova inscrição na newsletter</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      ${nomeLine}
      <strong>E-mail:</strong> ${escapeHtml(params.email)}<br>
      <strong>Origem:</strong> ${escapeHtml(params.origem)}
    </p>
    <p style="margin:0;">
      <a href="${siteUrl}/admin" style="display:inline-block;background:#e85d04;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
        Abrir painel admin
      </a>
    </p>
  `);

  const text = [
    "Nova inscrição na newsletter AMOPARK",
    params.nome ? `Nome: ${params.nome}` : "",
    `E-mail: ${params.email}`,
    `Origem: ${params.origem}`,
    `Painel: ${siteUrl}/admin`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: notifyTo,
    subject: `[AMOPARK] Nova inscrição na newsletter`,
    html,
    text,
    replyTo: params.email,
  });
}

/** Boas-vindas ao inscrito + aviso à diretoria (falhas são só logadas). */
export async function sendNewsletterSubscriptionEmails(params: {
  email: string;
  nome: string | null;
  origem: string;
}): Promise<void> {
  const results = await Promise.allSettled([
    sendNewsletterWelcomeEmail(params),
    sendNewsletterAdminNotifyEmail(params),
  ]);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] Falha ao enviar e-mail da newsletter:", r.reason);
    }
  }
}
