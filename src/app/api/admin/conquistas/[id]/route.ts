import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { deleteConquista, updateConquista } from "@/lib/conquistas-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
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
    const body = (await req.json()) as Record<string, unknown>;
    const patch: Parameters<typeof updateConquista>[1] = {};

    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.description === "string") patch.description = body.description;
    if (body.date_label === null) patch.date_label = null;
    else if (typeof body.date_label === "string") patch.date_label = body.date_label;

    if (typeof body.color_index === "number") patch.color_index = body.color_index;
    else if (typeof body.color_index === "string") {
      const n = parseInt(body.color_index, 10);
      if (!Number.isNaN(n)) patch.color_index = n;
    }

    const record = await updateConquista(id, patch);
    if (!record) {
      return NextResponse.json({ error: "Conquista não encontrada." }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err) {
    console.error("PATCH /api/admin/conquistas/[id]:", err);
    const message = toApiErrorMessage(err, "Erro ao atualizar.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const ok = await deleteConquista(id);
    if (!ok) {
      return NextResponse.json({ error: "Conquista não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/conquistas/[id]:", err);
    const message = toApiErrorMessage(err, "Erro ao remover.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
