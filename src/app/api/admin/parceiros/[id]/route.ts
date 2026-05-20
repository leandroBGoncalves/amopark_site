import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  deleteParceiroAdmin,
  ensureUniqueParceiroSlug,
  getParceiroAdminById,
  parsePartnerType,
  removeParceiroLogoAdmin,
  slugifyParceiroName,
  updateParceiroAdmin,
} from "@/lib/parceiros-db";
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
    const patch: Parameters<typeof updateParceiroAdmin>[1] = {};

    if (typeof body.name === "string") patch.name = body.name;
    if (typeof body.slug === "string" && body.slug.trim()) {
      const existing = await getParceiroAdminById(id);
      if (!existing) {
        return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
      }
      const base = slugifyParceiroName(body.slug.trim());
      patch.slug =
        base === existing.slug ? base : await ensureUniqueParceiroSlug(base);
    }
    if (body.partner_type !== undefined) {
      patch.partner_type = parsePartnerType(body.partner_type);
    }
    if (typeof body.summary === "string") patch.summary = body.summary;
    if (typeof body.description === "string") patch.description = body.description;
    if (body.website_url === null) patch.website_url = null;
    else if (typeof body.website_url === "string") patch.website_url = body.website_url;
    if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;
    if (typeof body.featured_home === "boolean") patch.featured_home = body.featured_home;
    if (typeof body.published === "boolean") patch.published = body.published;

    if (body.remove_logo === true) {
      const row = await removeParceiroLogoAdmin(id);
      if (!row) {
        return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
      }
      return NextResponse.json(row);
    }

    const row = await updateParceiroAdmin(id, patch);
    if (!row) {
      return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/admin/parceiros/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao atualizar.") },
      { status: 400 }
    );
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
    const ok = await deleteParceiroAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/parceiros/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao remover.") },
      { status: 500 }
    );
  }
}
