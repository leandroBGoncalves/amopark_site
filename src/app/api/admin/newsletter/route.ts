import { NextResponse } from "next/server";
import { listNewsletterInscricoesAdmin } from "@/lib/newsletter-db";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getCurrentUserAndAdmin();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json(
      { error: "Acesso restrito a administradores." },
      { status: 403 }
    );
  }

  try {
    const rows = await listNewsletterInscricoesAdmin();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/newsletter:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao listar inscrições.") },
      { status: 500 }
    );
  }
}
