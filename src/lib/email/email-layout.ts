import { siteConfig } from "@/lib/utils";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailLayout(content: string): string {
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

export function greetingHtml(nome: string | null): string {
  return nome ? `Olá, ${escapeHtml(nome)}!` : "Olá!";
}

export function greetingText(nome: string | null): string {
  return nome ? `Olá, ${nome}!` : "Olá!";
}

export function ctaButton(href: string, label: string): string {
  return `<p style="margin:0;">
    <a href="${href}" style="display:inline-block;background:#e85d04;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}
