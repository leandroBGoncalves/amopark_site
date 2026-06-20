import { getSiteBaseUrl, sendEmail } from "./mailer";
import {
  ctaButton,
  emailLayout,
  escapeHtml,
  greetingHtml,
  greetingText,
} from "./email-layout";
import type { FaleConoscoMensagemRow } from "@/lib/fale-conosco-types";
import {
  FALE_CONOSCO_STATUS_LABELS,
  FALE_CONOSCO_TIPO_LABELS,
} from "@/lib/fale-conosco-types";
import { isFaleConoscoAccessActive } from "@/lib/fale-conosco-db";
import { faleConoscoTrackingUrl } from "@/lib/fale-conosco-urls";
import { ROUTES } from "@/lib/constants";
import { siteConfig } from "@/lib/utils";

function getNotifyEmail(): string | null {
  return (
    process.env.FALE_CONOSCO_NOTIFY_EMAIL?.trim() ||
    process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    null
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendFaleConoscoAdminNotifyEmail(
  row: FaleConoscoMensagemRow
): Promise<boolean> {
  const notifyTo = getNotifyEmail();
  if (!notifyTo) {
    console.warn("[email] FALE_CONOSCO_NOTIFY_EMAIL não definido — aviso omitido.");
    return false;
  }

  const siteUrl = getSiteBaseUrl();
  const tipo = FALE_CONOSCO_TIPO_LABELS[row.tipo];
  const telefone = row.telefone
    ? `<strong>Telefone:</strong> ${escapeHtml(row.telefone)}<br>`
    : "";
  const assunto = row.assunto
    ? `<strong>Assunto:</strong> ${escapeHtml(row.assunto)}<br>`
    : "";

  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">Nova ${escapeHtml(tipo.toLowerCase())} recebida</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      <strong>Protocolo:</strong> ${escapeHtml(row.protocolo)}<br>
      <strong>Tipo:</strong> ${escapeHtml(tipo)}<br>
      <strong>Nome:</strong> ${escapeHtml(row.nome)}<br>
      <strong>E-mail:</strong> ${escapeHtml(row.email)}<br>
      ${telefone}
      ${assunto}
      <strong>Enviado em:</strong> ${escapeHtml(formatDateTime(row.created_at))}
    </p>
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;">Mensagem:</p>
    <p style="margin:0 0 20px;line-height:1.6;font-size:14px;white-space:pre-wrap;background:#f8f9fa;padding:12px;border-radius:8px;">${escapeHtml(row.mensagem)}</p>
    ${ctaButton(`${siteUrl}/admin`, "Responder no painel admin")}
  `);

  const text = [
    `Nova ${tipo} — protocolo ${row.protocolo}`,
    `Nome: ${row.nome}`,
    `E-mail: ${row.email}`,
    row.telefone ? `Telefone: ${row.telefone}` : "",
    row.assunto ? `Assunto: ${row.assunto}` : "",
    "",
    row.mensagem,
    "",
    `Painel: ${siteUrl}/admin`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: notifyTo,
    subject: `[AMOPARK] Nova ${tipo} — ${row.protocolo}`,
    html,
    text,
    replyTo: row.email,
  });
}

function trackingUrlFor(row: FaleConoscoMensagemRow): string | null {
  if (!row.access_token || !isFaleConoscoAccessActive(row)) return null;
  return faleConoscoTrackingUrl(row.access_token);
}

export async function sendFaleConoscoConfirmationEmail(
  row: FaleConoscoMensagemRow
): Promise<boolean> {
  const siteUrl = getSiteBaseUrl();
  const greeting = greetingHtml(row.nome);
  const tipo = FALE_CONOSCO_TIPO_LABELS[row.tipo];
  const trackingUrl = trackingUrlFor(row);

  const ctaBlock = trackingUrl
    ? ctaButton(trackingUrl, "Acompanhar solicitação")
    : ctaButton(`${siteUrl}${ROUTES.faleConosco}`, "Enviar mensagem");

  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greeting}</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      Recebemos sua <strong>${escapeHtml(tipo.toLowerCase())}</strong> enviada pelo site da AMOPARK.
      Guarde o protocolo abaixo para acompanhar:
    </p>
    <p style="margin:0 0 20px;padding:12px 16px;background:#f0f7ff;border-radius:8px;font-size:18px;font-weight:700;text-align:center;color:#1e5a8e;">
      ${escapeHtml(row.protocolo)}
    </p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      A diretoria analisará sua mensagem. Use o botão abaixo para ver o andamento enquanto a
      solicitação estiver aberta. Quando houver atualização, você também receberá um e-mail neste
      endereço (<strong>${escapeHtml(row.email)}</strong>).
    </p>
    ${ctaBlock}
  `);

  const text = [
    greetingText(row.nome),
    "",
    `Recebemos sua ${tipo.toLowerCase()}. Protocolo: ${row.protocolo}`,
    trackingUrl
      ? `Acompanhe em: ${trackingUrl}`
      : `Formulário: ${siteUrl}${ROUTES.faleConosco}`,
    "",
    "Quando houver atualização, enviaremos um e-mail para você.",
  ].join("\n");

  return sendEmail({
    to: row.email,
    subject: `[${siteConfig.name}] Protocolo ${row.protocolo} — recebemos sua mensagem`,
    html,
    text,
  });
}

export async function sendFaleConoscoUpdateEmail(
  row: FaleConoscoMensagemRow
): Promise<boolean> {
  const siteUrl = getSiteBaseUrl();
  const greeting = greetingHtml(row.nome);
  const statusLabel = FALE_CONOSCO_STATUS_LABELS[row.status];
  const tipo = FALE_CONOSCO_TIPO_LABELS[row.tipo];
  const trackingUrl = trackingUrlFor(row);

  const respostaBlock = row.resposta?.trim()
    ? `
    <p style="margin:20px 0 8px;font-size:13px;font-weight:600;">Resposta da AMOPARK:</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;white-space:pre-wrap;background:#f8f9fa;padding:12px;border-radius:8px;">${escapeHtml(row.resposta.trim())}</p>
  `
    : `<p style="margin:0 0 16px;line-height:1.6;font-size:14px;">Sua solicitação está sendo acompanhada pela diretoria.</p>`;

  const ctaBlock = trackingUrl
    ? ctaButton(trackingUrl, "Ver andamento")
    : row.status === "arquivado"
      ? ctaButton(`${siteUrl}${ROUTES.faleConosco}`, "Enviar nova mensagem")
      : "";

  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greeting}</p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      Há uma atualização sobre sua ${escapeHtml(tipo.toLowerCase())} (protocolo
      <strong>${escapeHtml(row.protocolo)}</strong>).
    </p>
    <p style="margin:0 0 16px;line-height:1.6;font-size:14px;">
      <strong>Status:</strong> ${escapeHtml(statusLabel)}
    </p>
    ${respostaBlock}
    ${ctaBlock}
  `);

  const text = [
    greetingText(row.nome),
    "",
    `Atualização — protocolo ${row.protocolo}`,
    `Status: ${statusLabel}`,
    row.resposta?.trim() ? `\nResposta:\n${row.resposta.trim()}` : "",
    trackingUrl ? `\nAcompanhe em: ${trackingUrl}` : "",
    !trackingUrl && row.status === "arquivado"
      ? `\nNova mensagem: ${siteUrl}${ROUTES.faleConosco}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: row.email,
    subject: `[${siteConfig.name}] Atualização — protocolo ${row.protocolo}`,
    html,
    text,
  });
}

export async function sendFaleConoscoSubmissionEmails(
  row: FaleConoscoMensagemRow
): Promise<void> {
  const results = await Promise.allSettled([
    sendFaleConoscoConfirmationEmail(row),
    sendFaleConoscoAdminNotifyEmail(row),
  ]);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] Falha no envio da ouvidoria:", r.reason);
    }
  }
}

export async function sendFaleConoscoUpdateEmailSafe(
  row: FaleConoscoMensagemRow
): Promise<boolean> {
  try {
    return await sendFaleConoscoUpdateEmail(row);
  } catch (err) {
    console.error("[email] Falha ao notificar atualização da ouvidoria:", err);
    return false;
  }
}
