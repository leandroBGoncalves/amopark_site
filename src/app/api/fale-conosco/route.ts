import { NextResponse } from "next/server";
import { sendFaleConoscoSubmissionEmails } from "@/lib/email/fale-conosco-emails";
import { insertFaleConoscoMensagem } from "@/lib/fale-conosco-db";
import { faleConoscoTrackingPath } from "@/lib/fale-conosco-urls";
import { parseFaleConoscoFormBody } from "@/lib/fale-conosco-validation";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const parsed = parseFaleConoscoFormBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { tipo, nome, email, telefone, assunto, mensagem } = parsed.data;
    const row = await insertFaleConoscoMensagem({
      tipo,
      nome,
      email,
      telefone,
      assunto,
      mensagem,
    });

    void sendFaleConoscoSubmissionEmails(row);

    const trackingPath = row.access_token
      ? faleConoscoTrackingPath(row.access_token)
      : null;

    return NextResponse.json({
      ok: true,
      protocolo: row.protocolo,
      trackingPath,
    });
  } catch (err) {
    console.error("POST /api/fale-conosco:", err);
    return NextResponse.json(
      {
        error: toApiErrorMessage(err, "Não foi possível enviar. Tente novamente."),
      },
      { status: 500 }
    );
  }
}
