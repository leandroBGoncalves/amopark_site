import { isDocxMime, isImageMime, isPdfMime } from "./oficios-upload";

const MAX_AUTO_TEXT = 2500;

function tryExtractNumero(text: string): string | null {
  const m = text.match(
    /(?:ofício|oficio)\s*n[.º°\s:,-]*\s*([A-Za-z0-9/.\-\s]{2,60})/i
  );
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function tryExtractDestinatario(text: string): string | null {
  const m = text.match(
    /(?:destinatário|destinatario|ao\(a\)\s+senhor\(a\))\s*[:\s\n]+([^\n\r]{3,120})/i
  );
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

export async function buildPublicationFields(
  mime: string,
  buffer: Buffer,
  opts: { manualSummary?: string }
): Promise<{
  summary: string;
  numeroOficio: string | null;
  destinatario: string | null;
}> {
  const manual = opts.manualSummary?.trim();
  if (manual) {
    return { summary: manual, numeroOficio: null, destinatario: null };
  }

  if (isDocxMime(mime)) {
    const mammoth = await import("mammoth");
    const extracted = await mammoth.extractRawText({ buffer });
    const raw = (extracted?.value ?? "").replace(/\s+/g, " ").trim();
    if (!raw) {
      return {
        summary:
          "Documento Word sem texto extraível na prévia; abra o anexo para ver o conteúdo.",
        numeroOficio: null,
        destinatario: null,
      };
    }
    return {
      summary:
        raw.slice(0, MAX_AUTO_TEXT) + (raw.length > MAX_AUTO_TEXT ? "…" : ""),
      numeroOficio: tryExtractNumero(raw),
      destinatario: tryExtractDestinatario(raw),
    };
  }

  if (isPdfMime(mime) || isImageMime(mime)) {
    return {
      summary:
        "Documento anexado (PDF ou imagem). Preencha o campo «Resumo no mural» antes de enviar se quiser texto na lista de transparência.",
      numeroOficio: null,
      destinatario: null,
    };
  }

  throw new Error("Tipo de arquivo não suportado para publicação.");
}
