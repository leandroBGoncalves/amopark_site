import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  ensureUniqueEventoSlug,
  insertEventoAdmin,
  listAllEventosAdmin,
  slugifyTitle,
} from "@/lib/eventos-db";
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
    const rows = await listAllEventosAdmin();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/eventos:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao listar eventos.") },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }
    const summary = typeof body.summary === "string" ? body.summary : "";
    const bodyText = typeof body.body === "string" ? body.body : "";
    const eventDate =
      typeof body.event_date === "string" ? body.event_date.trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json(
        { error: "Data do evento inválida (use AAAA-MM-DD)." },
        { status: 400 }
      );
    }
    const timeNote =
      typeof body.time_note === "string" ? body.time_note.trim() : "";
    const editionLabel =
      typeof body.edition_label === "string" ? body.edition_label.trim() : "";
    const slugRaw =
      typeof body.slug === "string" && body.slug.trim()
        ? slugifyTitle(body.slug.trim())
        : slugifyTitle(title);
    const slug = await ensureUniqueEventoSlug(slugRaw);
    const featuredHome = body.featured_home === true;
    const published = body.published !== false;

    const row = await insertEventoAdmin({
      slug,
      title,
      summary,
      body: bodyText,
      eventDate,
      timeNote: timeNote || null,
      editionLabel: editionLabel || null,
      featuredHome,
      published,
      userId: auth.userId,
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error("POST /api/admin/eventos:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao criar evento.") },
      { status: 400 }
    );
  }
}
