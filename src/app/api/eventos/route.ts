import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { listPublishedEventos } from "@/lib/eventos-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET() {
  noStore();
  try {
    const list = await listPublishedEventos();
    return NextResponse.json(list, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/eventos:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao carregar eventos.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
