const BUCKET = "eventos";

/** URL pública de imagem no bucket eventos (cliente e servidor). */
export function eventoPublicImageUrl(storagePath: string): string {
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  ).replace(/\/$/, "");
  if (!base || !storagePath) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
