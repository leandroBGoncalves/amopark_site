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
import {
  isAcceptedImageMime,
  processImageForUpload,
} from "@/lib/image-processing";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    if (!isAcceptedImageMime(mime)) {
      return NextResponse.json(
        { error: "Use imagem JPEG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }
    const raw = Buffer.from(await file.arrayBuffer());
    if (raw.length > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem muito grande (máx. 4 MB)." },
        { status: 400 }
      );
    }

    let processed;
    try {
      processed = await processImageForUpload(raw, mime, "parceiro-logo");
    } catch {
      return NextResponse.json(
        { error: "Não foi possível processar a imagem. Tente outro arquivo." },
        { status: 400 }
      );
    }

    const storagePath = `${id}/${randomUUID()}.${processed.extension}`;
    const supabase = createServiceRoleClient();
    const { error: upErr } = await supabase.storage
      .from(PARCEIROS_BUCKET)
      .upload(storagePath, processed.buffer, {
        contentType: processed.contentType,
        upsert: false,
      });

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
