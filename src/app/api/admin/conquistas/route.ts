import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import { insertConquista } from "@/lib/conquistas-db";
import { toApiErrorMessage } from "@/lib/supabase/postgrest-error";

export const dynamic = "force-dynamic";

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
    const title = typeof body.title === "string" ? body.title : "";
    const description =
      typeof body.description === "string" ? body.description : "";
    let dateLabel: string | null = null;
    if (body.date_label === null) dateLabel = null;
    else if (typeof body.date_label === "string") {
      dateLabel = body.date_label.trim() || null;
    }
    const colorRaw = body.color_index;
    const colorIndex =
      typeof colorRaw === "number"
        ? colorRaw
        : typeof colorRaw === "string"
          ? parseInt(colorRaw, 10)
          : 0;

    const record = await insertConquista({
      title,
      description,
      dateLabel,
      colorIndex: Number.isNaN(colorIndex) ? 0 : colorIndex,
      userId: auth.userId,
    });
    return NextResponse.json(record);
  } catch (err) {
    console.error("POST /api/admin/conquistas:", err);
    const message = toApiErrorMessage(err, "Erro ao criar conquista.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
