import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { getEventoParceirosAdmin, getEventoAdminById } from "@/lib/eventos-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function GET(
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

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const evento = await getEventoAdminById(id);
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }
    const parceiros = await getEventoParceirosAdmin(id);
    return NextResponse.json(parceiros);
  } catch (err) {
    console.error("GET /api/admin/eventos/[id]/parceiros:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao carregar parceiros do evento.") },
      { status: 500 }
    );
  }
}
