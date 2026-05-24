import { NextResponse } from "next/server";
import { insertContatoMensagem } from "@/lib/contato-db";
import { parseContatoFormBody } from "@/lib/contato-validation";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const parsed = parseContatoFormBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { nome, email, telefone, assunto, mensagem } = parsed.data;
    await insertContatoMensagem({ nome, email, telefone, assunto, mensagem });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/contato:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Não foi possível enviar sua mensagem. Tente novamente.") },
      { status: 500 }
    );
  }
}
