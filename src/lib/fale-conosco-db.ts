import { randomBytes } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  FaleConoscoMensagemRow,
  FaleConoscoStatus,
  FaleConoscoTipo,
  FaleConoscoTrackingLookup,
  FaleConoscoTrackingView,
} from "./fale-conosco-types";
import { isFaleConoscoStatus } from "./fale-conosco-types";
import { createServiceRoleClient } from "./supabase/service";

export function generateFaleConoscoAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

export function isFaleConoscoAccessActive(row: FaleConoscoMensagemRow): boolean {
  return !row.access_revoked_at && row.status !== "arquivado";
}

function toTrackingView(row: FaleConoscoMensagemRow): FaleConoscoTrackingView {
  return {
    protocolo: row.protocolo,
    tipo: row.tipo,
    status: row.status,
    assunto: row.assunto,
    mensagem: row.mensagem,
    resposta: row.resposta,
    resposta_at: row.resposta_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ensureUniqueAccessToken(base: string): Promise<string> {
  const supabase = createServiceRoleClient();
  let token = base;
  for (let n = 0; n < 8; n++) {
    const { data } = await supabase
      .from("fale_conosco_mensagens")
      .select("id")
      .eq("access_token", token)
      .maybeSingle();
    if (!data) return token;
    token = `${base.slice(0, 20)}${n + 1}${randomBytes(4).toString("base64url")}`;
  }
  return `${base}${Date.now().toString(36)}`;
}

function isFaleConoscoTableUnavailable(error: {
  message?: string;
  code?: string;
}): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    (m.includes("could not find the table") && m.includes("fale_conosco")) ||
    (m.includes("schema cache") && m.includes("fale_conosco"))
  );
}

export function generateFaleConoscoProtocolo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AMO-${date}-${rnd}`;
}

async function ensureUniqueProtocolo(base: string): Promise<string> {
  const supabase = createServiceRoleClient();
  let protocolo = base;
  for (let n = 0; n < 8; n++) {
    const { data } = await supabase
      .from("fale_conosco_mensagens")
      .select("id")
      .eq("protocolo", protocolo)
      .maybeSingle();
    if (!data) return protocolo;
    protocolo = `${base}-${n + 1}`;
  }
  return `${base}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export async function insertFaleConoscoMensagem(params: {
  tipo: FaleConoscoTipo;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
}): Promise<FaleConoscoMensagemRow> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const protocolo = await ensureUniqueProtocolo(generateFaleConoscoProtocolo());
  const access_token = await ensureUniqueAccessToken(generateFaleConoscoAccessToken());

  const { data, error } = await supabase
    .from("fale_conosco_mensagens")
    .insert({
      protocolo,
      access_token,
      tipo: params.tipo,
      nome: params.nome,
      email: params.email,
      telefone: params.telefone,
      assunto: params.assunto,
      mensagem: params.mensagem,
      status: "novo",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    if (isFaleConoscoTableUnavailable(error)) {
      throw new Error(
        "Formulário indisponível: execute a migration 015_fale_conosco.sql no Supabase."
      );
    }
    throw error;
  }

  return data as FaleConoscoMensagemRow;
}

export async function getFaleConoscoByAccessToken(
  token: string
): Promise<FaleConoscoTrackingLookup> {
  noStore();
  const trimmed = token.trim();
  if (!trimmed) return { kind: "not_found" };

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("fale_conosco_mensagens")
    .select("*")
    .eq("access_token", trimmed)
    .maybeSingle();

  if (error) {
    if (isFaleConoscoTableUnavailable(error)) {
      return { kind: "not_found" };
    }
    throw error;
  }

  if (!data) return { kind: "not_found" };

  const row = data as FaleConoscoMensagemRow;
  if (!isFaleConoscoAccessActive(row)) {
    return {
      kind: "revoked",
      protocolo: row.protocolo,
      revoked_at: row.access_revoked_at,
    };
  }

  return { kind: "active", data: toTrackingView(row) };
}

export async function listFaleConoscoMensagensAdmin(): Promise<FaleConoscoMensagemRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("fale_conosco_mensagens")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isFaleConoscoTableUnavailable(error)) {
      console.warn("listFaleConoscoMensagensAdmin: tabela indisponível.");
      return [];
    }
    throw error;
  }

  return (data ?? []) as FaleConoscoMensagemRow[];
}

export async function getFaleConoscoMensagemAdminById(
  id: string
): Promise<FaleConoscoMensagemRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("fale_conosco_mensagens")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as FaleConoscoMensagemRow) : null;
}

export async function updateFaleConoscoMensagemAdmin(
  id: string,
  patch: {
    status?: FaleConoscoStatus;
    resposta?: string | null;
  }
): Promise<FaleConoscoMensagemRow | null> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = { updated_at: now };

  if (patch.status !== undefined) {
    if (!isFaleConoscoStatus(patch.status)) {
      throw new Error("Status inválido.");
    }
    payload.status = patch.status;
    if (patch.status === "arquivado") {
      payload.access_revoked_at = now;
    }
  }

  if (patch.resposta !== undefined) {
    const text = patch.resposta === null ? null : patch.resposta.trim();
    payload.resposta = text || null;
    if (text) {
      payload.resposta_at = now;
      if (patch.status === undefined) {
        payload.status = "respondido";
      }
    }
  }

  if (Object.keys(payload).length === 1) {
    return getFaleConoscoMensagemAdminById(id);
  }

  const { data, error } = await supabase
    .from("fale_conosco_mensagens")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? (data as FaleConoscoMensagemRow) : null;
}

export async function deleteFaleConoscoMensagemAdmin(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("fale_conosco_mensagens").delete().eq("id", id);
  if (error) throw error;
  return true;
}
