import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { deleteEventoMidiaAdmin } from "@/lib/eventos-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; mediaId: string } }
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

  const { mediaId } = params;
  if (!mediaId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const ok = await deleteEventoMidiaAdmin(mediaId);
    if (!ok) {
      return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE .../midias/[mediaId]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao remover mídia.") },
      { status: 500 }
    );
  }
}
