import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  deleteEventoAdmin,
  ensureUniqueEventoSlug,
  getEventoAdminById,
  setEventoCoverAdmin,
  slugifyTitle,
  updateEventoAdmin,
} from "@/lib/eventos-db";
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
    const patch: Parameters<typeof updateEventoAdmin>[1] = {};

    if (typeof body.slug === "string" && body.slug.trim()) {
      const base = slugifyTitle(body.slug.trim());
      const existing = await getEventoAdminById(id);
      if (!existing) {
        return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
      }
      let slug = base;
      if (base !== existing.slug) {
        slug = await ensureUniqueEventoSlug(base);
      }
      patch.slug = slug;
    }
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.summary === "string") patch.summary = body.summary;
    if (typeof body.body === "string") patch.body = body.body;
    if (typeof body.event_date === "string") patch.event_date = body.event_date.trim();
    if (body.time_note === null) patch.time_note = null;
    else if (typeof body.time_note === "string") patch.time_note = body.time_note;
    if (body.edition_label === null) patch.edition_label = null;
    else if (typeof body.edition_label === "string") {
      patch.edition_label = body.edition_label;
    }
    if (typeof body.featured_home === "boolean") {
      patch.featured_home = body.featured_home;
    }
    if (typeof body.published === "boolean") patch.published = body.published;

    if (body.cover_media_id === null) {
      patch.cover_media_id = null;
    } else if (typeof body.cover_media_id === "string" && body.cover_media_id.trim()) {
      const row = await setEventoCoverAdmin(id, body.cover_media_id.trim());
      if (!row) {
        return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
      }
      return NextResponse.json(row);
    }

    const row = await updateEventoAdmin(id, patch);
    if (!row) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/admin/eventos/[id]:", err);
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
    const ok = await deleteEventoAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/eventos/[id]:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao remover.") },
      { status: 500 }
    );
  }
}
