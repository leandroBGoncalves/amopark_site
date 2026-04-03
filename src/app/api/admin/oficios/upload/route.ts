import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  BUCKET,
  getCurrentUserAndAdmin,
  insertOficio,
} from "@/lib/oficios-db";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { buildPublicationFields } from "@/lib/oficio-from-file";
import {
  UPLOAD_TYPE_HINT,
  normalizeUploadFile,
} from "@/lib/oficios-upload";
import {
  isOficioStatusValue,
  parseOficioStatus,
} from "@/lib/oficios-status";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const auth = await getCurrentUserAndAdmin();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo no campo file." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx. 15 MB)." },
        { status: 400 }
      );
    }

    const normalized = normalizeUploadFile(file);
    if (!normalized) {
      return NextResponse.json({ error: UPLOAD_TYPE_HINT }, { status: 400 });
    }
    const { mime, ext } = normalized;

    const nomeBase = file.name.replace(/\.[^/.]+$/i, "").trim() || "Documento";
    const titulo =
      typeof form.get("titulo") === "string" && (form.get("titulo") as string).trim()
        ? (form.get("titulo") as string).trim()
        : nomeBase;

    const resumoManual =
      typeof form.get("resumo") === "string" ? (form.get("resumo") as string).trim() : "";

    const statusRaw =
      typeof form.get("status") === "string" ? (form.get("status") as string).trim() : "";
    const status = isOficioStatusValue(statusRaw)
      ? statusRaw
      : parseOficioStatus(statusRaw);

    const extracted = await buildPublicationFields(mime, buffer, {
      manualSummary: resumoManual || undefined,
    });

    const manualNumero =
      typeof form.get("numero_oficio") === "string"
        ? (form.get("numero_oficio") as string).trim()
        : "";
    const manualDest =
      typeof form.get("destinatario") === "string"
        ? (form.get("destinatario") as string).trim()
        : "";
    const dataRaw =
      typeof form.get("data_oficio") === "string"
        ? (form.get("data_oficio") as string).trim()
        : "";

    const numeroOficio = manualNumero || extracted.numeroOficio;
    const destinatario = manualDest || extracted.destinatario;
    const summary = extracted.summary;

    const dataOficio = /^\d{4}-\d{2}-\d{2}$/.test(dataRaw) ? dataRaw : null;

    const fileId = randomUUID();
    const storagePath = `${auth.userId}/${fileId}.${ext}`;

    const service = createServiceRoleClient();
    const { error: upErr } = await service.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mime,
        upsert: false,
      });

    if (upErr) {
      console.error("Storage upload:", upErr);
      return NextResponse.json(
        { error: upErr.message || "Falha ao enviar arquivo ao storage." },
        { status: 500 }
      );
    }

    const record = await insertOficio({
      name: titulo,
      summary,
      numeroOficio,
      destinatario,
      dataOficio,
      status,
      storagePath,
      userId: auth.userId,
    });

    return NextResponse.json({ ok: true, oficio: record });
  } catch (err) {
    console.error("POST /api/admin/oficios/upload:", err);
    return NextResponse.json(
      { error: "Não foi possível concluir o envio. Tente novamente." },
      { status: 500 }
    );
  }
}
