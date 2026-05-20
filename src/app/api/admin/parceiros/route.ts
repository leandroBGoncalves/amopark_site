import { NextResponse } from "next/server";
import { getCurrentUserAndAdmin } from "@/lib/oficios-db";
import {
  ensureUniqueParceiroSlug,
  insertParceiroAdmin,
  listAllParceirosAdmin,
  parsePartnerType,
  slugifyParceiroName,
} from "@/lib/parceiros-db";
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
    const rows = await listAllParceirosAdmin();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/parceiros:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao listar parceiros.") },
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
    const name = typeof body.name === "string" ? body.name : "";
    const slugRaw =
      typeof body.slug === "string" && body.slug.trim()
        ? slugifyParceiroName(body.slug.trim())
        : slugifyParceiroName(name);
    const slug = await ensureUniqueParceiroSlug(slugRaw);
    const sortRaw = body.sort_order;
    const sortOrder =
      typeof sortRaw === "number"
        ? sortRaw
        : typeof sortRaw === "string"
          ? parseInt(sortRaw, 10)
          : 0;

    const row = await insertParceiroAdmin({
      name,
      slug,
      partnerType: parsePartnerType(body.partner_type),
      summary: typeof body.summary === "string" ? body.summary : "",
      description: typeof body.description === "string" ? body.description : "",
      websiteUrl:
        body.website_url === null
          ? null
          : typeof body.website_url === "string"
            ? body.website_url
            : null,
      sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
      featuredHome: body.featured_home === true,
      published: body.published !== false,
      userId: auth.userId,
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error("POST /api/admin/parceiros:", err);
    return NextResponse.json(
      { error: toApiErrorMessage(err, "Erro ao criar parceiro.") },
      { status: 400 }
    );
  }
}
