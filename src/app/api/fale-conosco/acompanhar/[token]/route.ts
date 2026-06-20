import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getFaleConoscoByAccessToken } from "@/lib/fale-conosco-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
} as const;

type RouteContext = { params: { token: string } };

export async function GET(_req: Request, { params }: RouteContext) {
  noStore();
  try {
    const result = await getFaleConoscoByAccessToken(params.token);
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/fale-conosco/acompanhar/[token]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao carregar andamento.") },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
