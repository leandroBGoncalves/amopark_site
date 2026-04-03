import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getAllOficios } from "@/lib/oficios-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Evita cache do Next e de CDN (ex.: Vercel) em GET /api/oficios. */
const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET(_request: Request) {
  noStore();
  try {
    const oficios = await getAllOficios();
    return NextResponse.json(oficios, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/oficios:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao carregar ofícios.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
