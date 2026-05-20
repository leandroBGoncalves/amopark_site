import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getAllConquistasWithMeta } from "@/lib/conquistas-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

const SETUP_HEADER = "X-Amopark-Conquistas-Setup" as const;

export async function GET() {
  noStore();
  try {
    const { records, tableUnavailable } = await getAllConquistasWithMeta();
    const headers: Record<string, string> = { ...NO_STORE_HEADERS };
    if (tableUnavailable) headers[SETUP_HEADER] = "1";
    return NextResponse.json(records, { headers });
  } catch (err) {
    console.error("GET /api/conquistas:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao carregar conquistas.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
