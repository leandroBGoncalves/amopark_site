import type { ParceiroRecord, ParceiroType } from "./parceiros-types";
import { PARCEIRO_TYPES } from "./parceiros-types";
import { parceiroPublicLogoUrl, PARCEIROS_BUCKET } from "./parceiros-media";
import {
  createPublicReadClient,
  createServiceRoleClient,
} from "./supabase/service";
import { formatPostgrestError } from "./supabase/postgrest-error";

export interface ParceiroRow {
  id: string;
  name: string;
  slug: string;
  partner_type: ParceiroType;
  summary: string;
  description: string;
  logo_storage_path: string | null;
  website_url: string | null;
  sort_order: number;
  featured_home: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: ParceiroRow): ParceiroRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    partnerType: row.partner_type,
    summary: row.summary,
    description: row.description,
    logoUrl: row.logo_storage_path
      ? parceiroPublicLogoUrl(row.logo_storage_path)
      : null,
    websiteUrl: row.website_url?.trim() || null,
    sortOrder: row.sort_order,
    featuredHome: row.featured_home,
    published: row.published,
  };
}

function isParceirosTableUnavailable(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    (m.includes("could not find the table") && m.includes("parceiros")) ||
    (m.includes("schema cache") && m.includes("parceiros"))
  );
}

export function slugifyParceiroName(name: string): string {
  const s = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "parceiro";
}

export async function ensureUniqueParceiroSlug(baseSlug: string): Promise<string> {
  const supabase = createServiceRoleClient();
  let slug = baseSlug;
  let n = 0;
  for (;;) {
    const { data } = await supabase
      .from("parceiros")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

function parsePartnerType(value: unknown): ParceiroType {
  if (
    typeof value === "string" &&
    (PARCEIRO_TYPES as readonly string[]).includes(value)
  ) {
    return value as ParceiroType;
  }
  return "cidadao";
}

export async function listPublishedParceiros(): Promise<ParceiroRecord[]> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (isParceirosTableUnavailable(error)) {
      console.warn("listPublishedParceiros: tabela parceiros indisponível.");
      return [];
    }
    throw new Error(formatPostgrestError(error));
  }
  return ((data ?? []) as ParceiroRow[]).map(rowToRecord);
}

export async function getPublishedParceiroBySlug(
  slug: string
): Promise<ParceiroRecord | null> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    if (isParceirosTableUnavailable(error)) return null;
    throw new Error(formatPostgrestError(error));
  }
  if (!data) return null;
  return rowToRecord(data as ParceiroRow);
}

export async function listHomeParceiroHighlights(
  limit: number
): Promise<ParceiroRecord[]> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("published", true)
    .eq("featured_home", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    if (isParceirosTableUnavailable(error)) return [];
    throw new Error(formatPostgrestError(error));
  }
  const rows = (data ?? []) as ParceiroRow[];
  if (rows.length >= limit) return rows.map(rowToRecord);

  const all = await listPublishedParceiros();
  const seen = new Set(rows.map((r) => r.id));
  const out = rows.map(rowToRecord);
  for (const p of all) {
    if (out.length >= limit) break;
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out.slice(0, limit);
}

export async function listAllParceirosAdmin(): Promise<ParceiroRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(formatPostgrestError(error));
  return (data ?? []) as ParceiroRow[];
}

export async function getParceiroAdminById(id: string): Promise<ParceiroRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(formatPostgrestError(error));
  return data ? (data as ParceiroRow) : null;
}

export async function insertParceiroAdmin(params: {
  name: string;
  slug: string;
  partnerType: ParceiroType;
  summary: string;
  description: string;
  websiteUrl: string | null;
  sortOrder: number;
  featuredHome: boolean;
  published: boolean;
  userId: string;
}): Promise<ParceiroRow> {
  const name = params.name.trim();
  if (!name) throw new Error("Nome é obrigatório.");

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("parceiros")
    .insert({
      name,
      slug: params.slug,
      partner_type: params.partnerType,
      summary: params.summary.trim(),
      description: params.description.trim(),
      website_url: params.websiteUrl?.trim() || null,
      sort_order: params.sortOrder,
      featured_home: params.featuredHome,
      published: params.published,
      created_by: params.userId,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatPostgrestError(error));
  return data as ParceiroRow;
}

export type ParceiroUpdatePayload = Partial<{
  name: string;
  slug: string;
  partner_type: ParceiroType;
  summary: string;
  description: string;
  website_url: string | null;
  logo_storage_path: string | null;
  sort_order: number;
  featured_home: boolean;
  published: boolean;
}>;

export async function updateParceiroAdmin(
  id: string,
  patch: ParceiroUpdatePayload
): Promise<ParceiroRow | null> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = { updated_at: now };

  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (!n) throw new Error("Nome não pode ficar vazio.");
    row.name = n;
  }
  if (patch.slug !== undefined) row.slug = patch.slug.trim();
  if (patch.partner_type !== undefined) row.partner_type = patch.partner_type;
  if (patch.summary !== undefined) row.summary = patch.summary.trim();
  if (patch.description !== undefined) row.description = patch.description.trim();
  if (patch.website_url !== undefined) {
    row.website_url =
      patch.website_url === null || patch.website_url === ""
        ? null
        : patch.website_url.trim();
  }
  if (patch.logo_storage_path !== undefined) {
    row.logo_storage_path = patch.logo_storage_path;
  }
  if (patch.sort_order !== undefined) row.sort_order = patch.sort_order;
  if (patch.featured_home !== undefined) row.featured_home = patch.featured_home;
  if (patch.published !== undefined) row.published = patch.published;

  if (Object.keys(row).length === 1) {
    return getParceiroAdminById(id);
  }

  const { data, error } = await supabase
    .from("parceiros")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(formatPostgrestError(error));
  return data ? (data as ParceiroRow) : null;
}

export async function setParceiroLogoAdmin(
  id: string,
  storagePath: string
): Promise<ParceiroRow | null> {
  const existing = await getParceiroAdminById(id);
  if (!existing) return null;

  const supabase = createServiceRoleClient();
  const oldPath = existing.logo_storage_path;

  const row = await updateParceiroAdmin(id, { logo_storage_path: storagePath });
  if (oldPath && oldPath !== storagePath) {
    await supabase.storage.from(PARCEIROS_BUCKET).remove([oldPath]);
  }
  return row;
}

export async function removeParceiroLogoAdmin(id: string): Promise<ParceiroRow | null> {
  const existing = await getParceiroAdminById(id);
  if (!existing) return null;
  const oldPath = existing.logo_storage_path;
  const row = await updateParceiroAdmin(id, { logo_storage_path: null });
  if (oldPath) {
    const supabase = createServiceRoleClient();
    await supabase.storage.from(PARCEIROS_BUCKET).remove([oldPath]);
  }
  return row;
}

export async function deleteParceiroAdmin(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const existing = await getParceiroAdminById(id);
  if (!existing) return false;

  const { error } = await supabase.from("parceiros").delete().eq("id", id);
  if (error) throw new Error(formatPostgrestError(error));

  if (existing.logo_storage_path) {
    await supabase.storage.from(PARCEIROS_BUCKET).remove([existing.logo_storage_path]);
  }
  return true;
}

export { parsePartnerType };
