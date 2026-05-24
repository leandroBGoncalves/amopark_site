import { NextResponse } from "next/server";
import {
  deleteContatoMensagemAdmin,
  updateContatoMensagemAdmin,
} from "@/lib/contato-db";
import { isContatoStatus } from "@/lib/contato-types";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function PATCH(req: Request, { params }: RouteContext) {
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
    const body = (await req.json()) as Record<string, unknown>;
    const status = typeof body.status === "string" ? body.status : "";
    if (!isContatoStatus(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const row = await updateContatoMensagemAdmin(params.id, { status });
    if (!row) {
      return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/admin/contato/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao atualizar mensagem.") },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
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
    await deleteContatoMensagemAdmin(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/contato/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao excluir mensagem.") },
      { status: 400 }
    );
  }
}
