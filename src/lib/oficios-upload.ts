export const ALLOWED_MIME = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const MIME_TO_EXT: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

const EXT_TO_MIME: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

/** Mensagem para API / UI quando o tipo não é aceito. */
export const UPLOAD_TYPE_HINT =
  "Formatos aceitos: Word (.docx), PDF (.pdf) e imagens (.jpg, .png, .gif, .webp).";

/**
 * Resolve MIME e extensão do arquivo (navegador às vezes manda type vazio ou octet-stream).
 */
export function normalizeUploadFile(file: File): { mime: string; ext: string } | null {
  const declared = (file.type || "").trim().toLowerCase();
  if (declared && ALLOWED_MIME.has(declared)) {
    return { mime: declared, ext: MIME_TO_EXT[declared] };
  }

  const match = /\.([a-z0-9]+)$/i.exec(file.name.trim());
  const extRaw = match ? match[1].toLowerCase() : "";
  const mime = EXT_TO_MIME[extRaw];
  if (!mime || !ALLOWED_MIME.has(mime)) return null;

  return { mime, ext: MIME_TO_EXT[mime] };
}

export function isDocxMime(mime: string): boolean {
  return mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export function isPdfMime(mime: string): boolean {
  return mime === "application/pdf";
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}
