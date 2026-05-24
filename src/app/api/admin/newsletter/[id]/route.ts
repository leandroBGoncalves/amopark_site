import { NextResponse } from "next/server";
import { deleteNewsletterInscricaoAdmin } from "@/lib/newsletter-db";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
    await deleteNewsletterInscricaoAdmin(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/newsletter/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao remover inscrição.") },
      { status: 400 }
    );
  }
}
