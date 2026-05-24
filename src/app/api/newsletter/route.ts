import { NextResponse } from "next/server";
import { sendNewsletterSubscriptionEmails } from "@/lib/email/newsletter-emails";
import { insertNewsletterInscricao } from "@/lib/newsletter-db";
import { parseNewsletterBody } from "@/lib/newsletter-validation";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const parsed = parseNewsletterBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const origem = "home";
    const result = await insertNewsletterInscricao({
      email: parsed.email,
      nome: parsed.nome,
      origem,
    });

    if (result === "created") {
      void sendNewsletterSubscriptionEmails({
        email: parsed.email,
        nome: parsed.nome,
        origem,
      }).catch((err) => {
        console.error("POST /api/newsletter: e-mails automáticos:", err);
      });
    }

    return NextResponse.json({
      ok: true,
      alreadyExists: result === "already_exists",
    });
  } catch (err) {
    console.error("POST /api/newsletter:", err);
    return NextResponse.json(
      {
        error: toApiErrorMessage(
          err,
          "Não foi possível concluir a inscrição. Tente novamente."
        ),
      },
      { status: 500 }
    );
  }
}
