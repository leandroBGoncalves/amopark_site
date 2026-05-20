import type { OficioRecord } from "./oficios-types";
import type { OficioStatusValue } from "./oficios-status";
import { parseOficioStatus } from "./oficios-status";
import {
  createPublicReadClient,
  createServiceRoleClient,
} from "./supabase/service";
import { createServerSupabaseClient } from "./supabase/server";
import { getSupabaseUrl } from "./supabase/env";
import { sortOficiosChronologically } from "./oficios-sort";

const BUCKET = "oficios";

export interface OficioRow {
  id: string;
  name: string;
  summary: string;
  numero_oficio: string | null;
  destinatario: string | null;
  data_oficio?: string | null;
  status?: string | null;
  storage_path: string | null;
  drive_file_id: string | null;
  web_view_link: string | null;
  created_at: string;
  updated_at: string;
}

function publicFileUrl(storagePath: string): string {
  const base = getSupabaseUrl().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export function rowToRecord(row: OficioRow): OficioRecord {
  let webViewLink = row.web_view_link ?? "";
  if (row.storage_path) {
    webViewLink = publicFileUrl(row.storage_path);
  }
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    numeroOficio: row.numero_oficio,
    destinatario: row.destinatario,
    dataOficio: row.data_oficio ?? null,
    status: parseOficioStatus(row.status),
    createdTime: row.created_at,
    syncedAt: row.updated_at,
    driveFileId: row.drive_file_id ?? undefined,
    storageFilename: row.storage_path ?? undefined,
    webViewLink,
  };
}

/** Lista pública (chave anon + RLS `oficios_select_public`). */
export async function getAllOficios(): Promise<OficioRecord[]> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("oficios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOficios:", error);
    throw new Error(
      `Não foi possível carregar ofícios: ${error.message}. Verifique RLS (SELECT público em oficios) e SUPABASE_ANON_KEY.`
    );
  }
  const records = ((data ?? []) as OficioRow[]).map(rowToRecord);
  return sortOficiosChronologically(records);
}

export async function getOficioById(id: string): Promise<OficioRecord | null> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("oficios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getOficioById:", error);
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToRecord(data as OficioRow);
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return (data as { role: string }).role === "admin";
}

export async function getCurrentUserAndAdmin(): Promise<{
  userId: string;
  isAdmin: boolean;
} | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const isAdmin = await isUserAdmin(user.id);
  return { userId: user.id, isAdmin };
}

export async function insertOficio(params: {
  name: string;
  summary: string;
  numeroOficio: string | null;
  destinatario: string | null;
  dataOficio: string | null;
  status: OficioStatusValue;
  storagePath: string;
  userId: string;
}): Promise<OficioRecord> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("oficios")
    .insert({
      name: params.name,
      summary: params.summary,
      numero_oficio: params.numeroOficio,
      destinatario: params.destinatario,
      data_oficio: params.dataOficio,
      status: params.status,
      storage_path: params.storagePath,
      created_by: params.userId,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToRecord(data as OficioRow);
}

export type OficioUpdatePayload = Partial<{
  status: OficioStatusValue;
  name: string;
  summary: string;
  numero_oficio: string | null;
  destinatario: string | null;
  data_oficio: string | null;
}>;

const UPDATE_KEYS: (keyof OficioUpdatePayload)[] = [
  "status",
  "name",
  "summary",
  "numero_oficio",
  "destinatario",
  "data_oficio",
];

export async function updateOficio(
  id: string,
  patch: OficioUpdatePayload
): Promise<OficioRecord | null> {
  const hasAny = UPDATE_KEYS.some((k) => patch[k] !== undefined);
  if (!hasAny) {
    return getOficioById(id);
  }

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = { updated_at: now };

  if (patch.status !== undefined) row.status = patch.status;
  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (!n) throw new Error("Título não pode ficar vazio.");
    row.name = n;
  }
  if (patch.summary !== undefined) {
    row.summary = patch.summary.trim();
  }
  if (patch.numero_oficio !== undefined) {
    const v = patch.numero_oficio;
    row.numero_oficio =
      v === null || v === "" ? null : String(v).trim() || null;
  }
  if (patch.destinatario !== undefined) {
    const v = patch.destinatario;
    row.destinatario =
      v === null || v === "" ? null : String(v).trim() || null;
  }
  if (patch.data_oficio !== undefined) {
    const d = patch.data_oficio;
    if (d === null || d === "") row.data_oficio = null;
    else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) row.data_oficio = d;
    else throw new Error("Data do ofício inválida. Use AAAA-MM-DD.");
  }

  const { data, error } = await supabase
    .from("oficios")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToRecord(data as OficioRow);
}

export async function deleteOficioRow(id: string): Promise<OficioRow | null> {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from("oficios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) return null;

  const { error } = await supabase.from("oficios").delete().eq("id", id);
  if (error) throw error;
  return row as OficioRow;
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function removeOficioComplete(id: string): Promise<OficioRecord | null> {
  const row = await deleteOficioRow(id);
  if (!row) return null;
  if (row.storage_path) await deleteStorageObject(row.storage_path);
  return rowToRecord(row);
}

export { BUCKET };
