import type { ConquistaRecord } from "./conquistas-types";
import {
  createPublicReadClient,
  createServiceRoleClient,
} from "./supabase/service";
import { formatPostgrestError } from "./supabase/postgrest-error";

export interface ConquistaRow {
  id: string;
  title: string;
  description: string;
  date_label: string | null;
  color_index: number;
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: ConquistaRow): ConquistaRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dateLabel: row.date_label,
    colorIndex: row.color_index,
    createdAt: row.created_at,
  };
}

function clampColorIndex(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.floor(n)));
}

/** Tabela ausente ou ainda fora do cache do PostgREST (ex.: PGRST205). */
function isConquistasTableUnavailable(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    (m.includes("could not find the table") && m.includes("conquistas")) ||
    (m.includes("schema cache") && m.includes("conquistas"))
  );
}

export type ConquistasListResult = {
  records: ConquistaRecord[];
  /** true quando `public.conquistas` não existe ou o PostgREST ainda não recarregou o schema. */
  tableUnavailable: boolean;
};

export async function getAllConquistasWithMeta(): Promise<ConquistasListResult> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("conquistas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isConquistasTableUnavailable(error)) {
      console.warn(
        "getAllConquistas: tabela public.conquistas indisponível (rode a migration 006 no Supabase)."
      );
      return { records: [], tableUnavailable: true };
    }
    console.error("getAllConquistas:", error);
    throw new Error(
      `Não foi possível carregar conquistas: ${error.message}. Se a tabela existir, verifique RLS e variáveis do Supabase.`
    );
  }
  return {
    records: ((data ?? []) as ConquistaRow[]).map(rowToRecord),
    tableUnavailable: false,
  };
}

export async function getAllConquistas(): Promise<ConquistaRecord[]> {
  const { records } = await getAllConquistasWithMeta();
  return records;
}

export async function insertConquista(params: {
  title: string;
  description: string;
  dateLabel: string | null;
  colorIndex: number;
  userId: string;
}): Promise<ConquistaRecord> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const title = params.title.trim();
  if (!title) throw new Error("Título é obrigatório.");

  const { data, error } = await supabase
    .from("conquistas")
    .insert({
      title,
      description: params.description.trim(),
      date_label: params.dateLabel?.trim() || null,
      color_index: clampColorIndex(params.colorIndex),
      created_by: params.userId,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatPostgrestError(error));
  return rowToRecord(data as ConquistaRow);
}

export type ConquistaUpdatePayload = Partial<{
  title: string;
  description: string;
  date_label: string | null;
  color_index: number;
}>;

export async function updateConquista(
  id: string,
  patch: ConquistaUpdatePayload
): Promise<ConquistaRecord | null> {
  const hasAny =
    patch.title !== undefined ||
    patch.description !== undefined ||
    patch.date_label !== undefined ||
    patch.color_index !== undefined;
  if (!hasAny) {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("conquistas")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(formatPostgrestError(error));
    if (!data) return null;
    return rowToRecord(data as ConquistaRow);
  }

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = { updated_at: now };

  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) throw new Error("Título não pode ficar vazio.");
    row.title = t;
  }
  if (patch.description !== undefined) {
    row.description = patch.description.trim();
  }
  if (patch.date_label !== undefined) {
    const v = patch.date_label;
    row.date_label = v === null || v === "" ? null : v.trim() || null;
  }
  if (patch.color_index !== undefined) {
    row.color_index = clampColorIndex(patch.color_index);
  }

  const { data, error } = await supabase
    .from("conquistas")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(formatPostgrestError(error));
  if (!data) return null;
  return rowToRecord(data as ConquistaRow);
}

export async function deleteConquista(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from("conquistas")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!row) return false;
  const { error } = await supabase.from("conquistas").delete().eq("id", id);
  if (error) throw new Error(formatPostgrestError(error));
  return true;
}
