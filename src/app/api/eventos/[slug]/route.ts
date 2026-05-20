import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getPublishedEventoBySlug } from "@/lib/eventos-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  noStore();
  const slug = params.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }
  try {
    const ev = await getPublishedEventoBySlug(slug);
    if (!ev) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }
    return NextResponse.json(ev, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/eventos/[slug]:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao carregar evento.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
