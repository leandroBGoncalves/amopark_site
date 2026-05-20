import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  EVENTOS_BUCKET,
  getEventoAdminById,
  getEventoMidiasAdmin,
  insertEventoMidiaImage,
  insertEventoMidiaVideo,
} from "@/lib/eventos-db";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

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
    const rows = await getEventoMidiasAdmin(id);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET .../midias:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao listar mídias.") },
      { status: 500 }
    );
  }
}

export async function POST(
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

  const { id: eventoId } = params;
  if (!eventoId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const ev = await getEventoAdminById(eventoId);
  if (!ev) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const ctype = req.headers.get("content-type") ?? "";

  try {
    if (ctype.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      const url = typeof body.embed_url === "string" ? body.embed_url : "";
      const caption =
        typeof body.caption === "string" ? body.caption : null;
      const row = await insertEventoMidiaVideo({
        eventoId,
        embedUrl: url,
        caption,
      });
      return NextResponse.json(row);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Envie um arquivo de imagem ou JSON com embed_url (YouTube)." },
        { status: 400 }
      );
    }
    const mime = file.type || "application/octet-stream";
    if (!IMAGE_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Use imagem JPEG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem muito grande (máx. 8 MB)." },
        { status: 400 }
      );
    }
    const caption =
      typeof form.get("caption") === "string"
        ? (form.get("caption") as string).trim() || null
        : null;

    const ext = extFromMime(mime);
    const storagePath = `${eventoId}/${randomUUID()}.${ext}`;

    const supabase = createServiceRoleClient();
    const { error: upErr } = await supabase.storage
      .from(EVENTOS_BUCKET)
      .upload(storagePath, buf, { contentType: mime, upsert: false });

    if (upErr) {
      throw new Error(upErr.message);
    }

    const row = await insertEventoMidiaImage({
      eventoId,
      storagePath,
      caption,
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error("POST .../midias:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao adicionar mídia.") },
      { status: 400 }
    );
  }
}
