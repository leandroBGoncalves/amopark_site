import { NextResponse } from "next/server";
import {
  getCurrentUserAndAdmin,
  removeOficioComplete,
  updateOficio,
  type OficioUpdatePayload,
} from "@/lib/oficios-db";
import { isOficioStatusValue } from "@/lib/oficios-status";

export const dynamic = "force-dynamic";

const PATCH_KEYS = [
  "status",
  "name",
  "summary",
  "numero_oficio",
  "destinatario",
  "data_oficio",
] as const;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getCurrentUserAndAdmin();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const patch: OficioUpdatePayload = {};
  let hasField = false;

  for (const key of PATCH_KEYS) {
    if (!(key in b)) continue;
    hasField = true;
    const val = b[key];

    if (key === "status") {
      if (typeof val !== "string" || !isOficioStatusValue(val)) {
        return NextResponse.json({ error: "Status inválido." }, { status: 400 });
      }
      patch.status = val;
      continue;
    }

    if (key === "name") {
      if (typeof val !== "string") {
        return NextResponse.json({ error: "Título inválido." }, { status: 400 });
      }
      patch.name = val;
      continue;
    }

    if (key === "summary") {
      if (typeof val !== "string") {
        return NextResponse.json({ error: "Resumo inválido." }, { status: 400 });
      }
      patch.summary = val;
      continue;
    }

    if (key === "numero_oficio" || key === "destinatario") {
      if (val === null) {
        patch[key] = null;
      } else if (typeof val === "string") {
        patch[key] = val;
      } else {
        return NextResponse.json(
          { error: `${key} deve ser string ou null.` },
          { status: 400 }
        );
      }
      continue;
    }

    if (key === "data_oficio") {
      if (val === null) {
        patch.data_oficio = null;
      } else if (typeof val === "string") {
        patch.data_oficio = val;
      } else {
        return NextResponse.json(
          { error: "data_oficio deve ser string (AAAA-MM-DD) ou null." },
          { status: 400 }
        );
      }
    }
  }

  if (!hasField) {
    return NextResponse.json(
      {
        error:
          "Envie ao menos um campo: status, name, summary, numero_oficio, destinatario, data_oficio.",
      },
      { status: 400 }
    );
  }

  const { id } = params;
  try {
    const updated = await updateOficio(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Ofício não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, oficio: updated });
  } catch (err) {
    console.error("PATCH /api/admin/oficios/[id]:", err);
    const msg = err instanceof Error ? err.message : "Erro ao atualizar.";
    return NextResponse.json({ error: msg }, { status: 500 });
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
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const { id } = params;
  const removed = await removeOficioComplete(id);
  if (!removed) {
    return NextResponse.json({ error: "Ofício não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
