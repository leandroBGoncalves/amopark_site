const BUCKET = "parceiros";

export function parceiroPublicLogoUrl(storagePath: string): string {
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  ).replace(/\/$/, "");
  if (!base || !storagePath) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export { BUCKET as PARCEIROS_BUCKET };
