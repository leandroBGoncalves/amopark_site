import sharp from "sharp";

export const ACCEPTED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type ImageUploadPreset = "evento-galeria" | "parceiro-logo";

export type ProcessedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

export function isAcceptedImageMime(mime: string): boolean {
  return ACCEPTED_IMAGE_MIMES.has(mime);
}

/** Redimensiona e comprime antes do upload ao Supabase. GIF animado é mantido sem alteração. */
export async function processImageForUpload(
  input: Buffer,
  mime: string,
  preset: ImageUploadPreset
): Promise<ProcessedImage> {
  if (mime === "image/gif") {
    return { buffer: input, contentType: mime, extension: "gif" };
  }

  const pipeline = sharp(input).rotate();

  if (preset === "evento-galeria") {
    const buffer = await pipeline
      .resize(1600, 1600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer, contentType: "image/webp", extension: "webp" };
  }

  const buffer = await pipeline
    .resize(400, 400, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 85 })
    .toBuffer();

  return { buffer, contentType: "image/webp", extension: "webp" };
}
