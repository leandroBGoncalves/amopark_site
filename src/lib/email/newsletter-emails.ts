import { getSiteBaseUrl, sendEmail } from "./mailer";
import {
  ctaButton,
  emailLayout,
  escapeHtml,
  greetingHtml,
  greetingText,
} from "./email-layout";
import { siteConfig } from "@/lib/utils";

export async function sendNewsletterWelcomeEmail(params: {
  email: string;
  nome: string | null;
}): Promise<boolean> {
  const siteUrl = getSiteBaseUrl();
  const greeting = greetingHtml(params.nome);

  const html = emailLayout(`
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
    greetingText(params.nome),
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

  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">Nova inscrição na newsletter</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      ${nomeLine}
      <strong>E-mail:</strong> ${escapeHtml(params.email)}<br>
      <strong>Origem:</strong> ${escapeHtml(params.origem)}
    </p>
    ${ctaButton(`${siteUrl}/admin`, "Abrir painel admin")}
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
