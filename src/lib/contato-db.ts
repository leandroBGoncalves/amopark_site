import type { ContatoMensagemRow, ContatoStatus } from "./contato-types";
import { isContatoStatus } from "./contato-types";
import { createServiceRoleClient } from "./supabase/service";

function isContatoTableUnavailable(error: {
  message?: string;
  code?: string;
}): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    (m.includes("could not find the table") && m.includes("contato_mensagens")) ||
    (m.includes("schema cache") && m.includes("contato_mensagens"))
  );
}

export async function insertContatoMensagem(params: {
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
}): Promise<ContatoMensagemRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contato_mensagens")
    .insert({
      nome: params.nome,
      email: params.email,
      telefone: params.telefone,
      assunto: params.assunto,
      mensagem: params.mensagem,
      status: "novo",
    })
    .select()
    .single();

  if (error) {
    if (isContatoTableUnavailable(error)) {
      throw new Error(
        "Formulário indisponível: execute a migration 010_contato_mensagens.sql no Supabase."
      );
    }
    throw error;
  }

  return data as ContatoMensagemRow;
}

export async function listContatoMensagensAdmin(): Promise<ContatoMensagemRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contato_mensagens")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isContatoTableUnavailable(error)) {
      console.warn("listContatoMensagensAdmin: tabela contato_mensagens indisponível.");
      return [];
    }
    throw error;
  }

  return (data ?? []) as ContatoMensagemRow[];
}

export async function updateContatoMensagemAdmin(
  id: string,
  patch: { status?: ContatoStatus }
): Promise<ContatoMensagemRow | null> {
  const supabase = createServiceRoleClient();
  const payload: Record<string, unknown> = {};

  if (patch.status) {
    if (!isContatoStatus(patch.status)) {
      throw new Error("Status inválido.");
    }
    payload.status = patch.status;
    if (patch.status === "lido") {
      payload.read_at = new Date().toISOString();
    }
    if (patch.status === "novo") {
      payload.read_at = null;
    }
  }

  if (Object.keys(payload).length === 0) {
    return getContatoMensagemAdminById(id);
  }

  const { data, error } = await supabase
    .from("contato_mensagens")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? (data as ContatoMensagemRow) : null;
}

export async function getContatoMensagemAdminById(
  id: string
): Promise<ContatoMensagemRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contato_mensagens")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as ContatoMensagemRow) : null;
}

export async function deleteContatoMensagemAdmin(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("contato_mensagens").delete().eq("id", id);
  if (error) throw error;
  return true;
}
