import { NextResponse } from "next/server";
import { listPublishedParceiros } from "@/lib/parceiros-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const list = await listPublishedParceiros();
    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/parceiros:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar parceiros." },
      { status: 500 }
    );
  }
}
