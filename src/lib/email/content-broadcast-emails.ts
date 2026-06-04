import { ROUTES } from "@/lib/constants";
import type { ConquistaRecord } from "@/lib/conquistas-types";
import type { OficioRecord } from "@/lib/oficios-types";
import { oficioStatusLabel } from "@/lib/oficios-status";
import { getSiteBaseUrl } from "./mailer";
import {
  ctaButton,
  emailLayout,
  escapeHtml,
  greetingHtml,
  greetingText,
} from "./email-layout";
import { notifyNewsletterSubscribers } from "./subscriber-notify";
import { siteConfig } from "@/lib/utils";

function formatBrDate(iso: string): string {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return iso;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function truncate(value: string, max: number): string {
  const t = value.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function summaryBlock(summary: string): { html: string; text: string } {
  const s = summary.trim();
  if (!s) return { html: "", text: "" };
  const short = truncate(s, 280);
  return {
    html: `<p style="margin:0 0 16px;line-height:1.6;font-size:14px;color:#4a5568;">${escapeHtml(short)}</p>`,
    text: `\n${short}\n`,
  };
}

export async function notifySubscribersOfNewOficio(oficio: OficioRecord): Promise<void> {
  const siteUrl = getSiteBaseUrl();
  const pageUrl = `${siteUrl}${ROUTES.transparencia}`;
  const status = oficioStatusLabel(oficio.status);
  const numero = oficio.numeroOficio?.trim();
  const metaParts: string[] = [
    numero ? `Nº ${numero}` : null,
    oficio.dataOficio ? formatBrDate(oficio.dataOficio) : null,
    status,
  ].filter((p): p is string => Boolean(p));

  await notifyNewsletterSubscribers((subscriber) => {
    const { html: sumHtml, text: sumText } = summaryBlock(oficio.summary);
    const metaHtml = metaParts.length
      ? `<p style="margin:0 0 12px;font-size:13px;color:#718096;">${metaParts.map(escapeHtml).join(" · ")}</p>`
      : "";
    const metaText = metaParts.length ? `\n${metaParts.join(" · ")}\n` : "";

    const html = emailLayout(`
      <p style="margin:0 0 8px;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:.04em;">Novo no mural de ofícios</p>
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greetingHtml(subscriber.nome)}</p>
      <p style="margin:0 0 12px;line-height:1.6;font-size:14px;">
        A <strong>${escapeHtml(siteConfig.name)}</strong> publicou um novo documento no mural de transparência:
      </p>
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1e5a8e;">${escapeHtml(oficio.name)}</p>
      ${metaHtml}
      ${sumHtml}
      ${ctaButton(pageUrl, "Ver mural de ofícios")}
      <p style="margin:20px 0 0;font-size:12px;color:#718096;line-height:1.5;">
        Você recebe este e-mail por estar inscrito na newsletter. Se não deseja mais receber, responda pedindo o descadastro.
      </p>
    `);

    const text = [
      greetingText(subscriber.nome),
      "",
      "Novo ofício no mural de transparência da AMOPARK:",
      oficio.name,
      metaText.trim(),
      sumText.trim(),
      "",
      `Ver no site: ${pageUrl}`,
      "",
      "Você recebe este e-mail por estar inscrito na newsletter.",
    ]
      .filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== ""))
      .join("\n");

    return {
      subject: `[${siteConfig.name}] Novo ofício: ${truncate(oficio.name, 60)}`,
      html,
      text,
    };
  });
}

export type EventoNotifyKind = "new" | "updated";

export async function notifySubscribersOfEvento(
  evento: {
    slug: string;
    title: string;
    summary: string;
    eventDate: string;
    timeNote: string | null;
  },
  kind: EventoNotifyKind = "new"
): Promise<void> {
  const siteUrl = getSiteBaseUrl();
  const pageUrl = `${siteUrl}${ROUTES.eventos}/${evento.slug}`;
  const dateLine = formatBrDate(evento.eventDate);
  const timeLine = evento.timeNote?.trim();
  const isUpdate = kind === "updated";
  const badge = isUpdate ? "Evento atualizado" : "Novo evento";
  const intro = isUpdate
    ? "Um evento do calendário do North Park foi atualizado:"
    : "Confira o evento confirmado no North Park:";
  const subjectPrefix = isUpdate ? "Evento atualizado" : "Novo evento";

  await notifyNewsletterSubscribers((subscriber) => {
    const { html: sumHtml, text: sumText } = summaryBlock(evento.summary);
    const whenHtml = timeLine
      ? `<p style="margin:0 0 12px;font-size:13px;color:#718096;"><strong>Data:</strong> ${escapeHtml(dateLine)} · ${escapeHtml(timeLine)}</p>`
      : `<p style="margin:0 0 12px;font-size:13px;color:#718096;"><strong>Data:</strong> ${escapeHtml(dateLine)}</p>`;
    const whenText = timeLine ? `Data: ${dateLine} · ${timeLine}` : `Data: ${dateLine}`;

    const html = emailLayout(`
      <p style="margin:0 0 8px;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:.04em;">${badge}</p>
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greetingHtml(subscriber.nome)}</p>
      <p style="margin:0 0 12px;line-height:1.6;font-size:14px;">
        ${intro}
      </p>
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1e5a8e;">${escapeHtml(evento.title)}</p>
      ${whenHtml}
      ${sumHtml}
      ${ctaButton(pageUrl, "Ver detalhes do evento")}
      <p style="margin:20px 0 0;font-size:12px;color:#718096;line-height:1.5;">
        Você recebe este e-mail por estar inscrito na newsletter. Se não deseja mais receber, responda pedindo o descadastro.
      </p>
    `);

    const text = [
      greetingText(subscriber.nome),
      "",
      isUpdate ? "Evento atualizado no North Park:" : "Novo evento no North Park:",
      evento.title,
      whenText,
      sumText.trim(),
      "",
      `Ver no site: ${pageUrl}`,
      "",
      "Você recebe este e-mail por estar inscrito na newsletter.",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      subject: `[${siteConfig.name}] ${subjectPrefix}: ${truncate(evento.title, 60)}`,
      html,
      text,
    };
  });
}

export async function notifySubscribersOfNewConquista(conquista: ConquistaRecord): Promise<void> {
  const siteUrl = getSiteBaseUrl();
  const pageUrl = `${siteUrl}${ROUTES.noticias}`;

  await notifyNewsletterSubscribers((subscriber) => {
    const { html: descHtml, text: descText } = summaryBlock(conquista.description);
    const dateHtml = conquista.dateLabel?.trim()
      ? `<p style="margin:0 0 12px;font-size:13px;color:#718096;">${escapeHtml(conquista.dateLabel.trim())}</p>`
      : "";
    const dateText = conquista.dateLabel?.trim() ?? "";

    const html = emailLayout(`
      <p style="margin:0 0 8px;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:.04em;">Nova conquista</p>
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${greetingHtml(subscriber.nome)}</p>
      <p style="margin:0 0 12px;line-height:1.6;font-size:14px;">
        Vitória do bairro em primeira mão:
      </p>
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1e5a8e;">${escapeHtml(conquista.title)}</p>
      ${dateHtml}
      ${descHtml}
      ${ctaButton(pageUrl, "Ver conquistas e notícias")}
      <p style="margin:20px 0 0;font-size:12px;color:#718096;line-height:1.5;">
        Você recebe este e-mail por estar inscrito na newsletter. Se não deseja mais receber, responda pedindo o descadastro.
      </p>
    `);

    const text = [
      greetingText(subscriber.nome),
      "",
      "Nova conquista da AMOPARK:",
      conquista.title,
      dateText,
      descText.trim(),
      "",
      `Ver no site: ${pageUrl}`,
      "",
      "Você recebe este e-mail por estar inscrito na newsletter.",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      subject: `[${siteConfig.name}] Nova conquista: ${truncate(conquista.title, 60)}`,
      html,
      text,
    };
  });
}
