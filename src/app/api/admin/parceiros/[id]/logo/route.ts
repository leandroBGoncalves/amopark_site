import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  getParceiroAdminById,
  setParceiroLogoAdmin,
} from "@/lib/parceiros-db";
import { PARCEIROS_BUCKET } from "@/lib/parceiros-media";
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

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const parceiro = await getParceiroAdminById(id);
  if (!parceiro) {
    return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Envie um arquivo de imagem (logo ou foto)." },
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
    if (buf.length > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem muito grande (máx. 4 MB)." },
        { status: 400 }
      );
    }

    const ext = extFromMime(mime);
    const storagePath = `${id}/${randomUUID()}.${ext}`;
    const supabase = createServiceRoleClient();
    const { error: upErr } = await supabase.storage
      .from(PARCEIROS_BUCKET)
      .upload(storagePath, buf, { contentType: mime, upsert: false });

    if (upErr) throw new Error(upErr.message);

    const row = await setParceiroLogoAdmin(id, storagePath);
    return NextResponse.json(row);
  } catch (err) {
    console.error("POST .../logo:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro no upload do logo.") },
      { status: 400 }
    );
  }
}
