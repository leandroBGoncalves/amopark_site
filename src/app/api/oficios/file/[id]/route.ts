import { NextResponse } from "next/server";
import { getOficioById } from "@/lib/oficios-db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let oficio;
  try {
    oficio = await getOficioById(id);
  } catch (err) {
    console.error("GET /api/oficios/file:", err);
    return NextResponse.json(
      { error: "Erro ao buscar documento." },
      { status: 500 }
    );
  }
  if (!oficio) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  if (oficio.webViewLink.startsWith("http")) {
    return NextResponse.redirect(oficio.webViewLink);
  }

  return NextResponse.json(
    { error: "Documento sem URL de download." },
    { status: 404 }
  );
}
