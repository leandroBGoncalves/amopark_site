import { createServiceRoleClient } from "./supabase/service";

export interface NewsletterInscricaoRow {
  id: string;
  email: string;
  nome: string | null;
  origem: string;
  created_at: string;
}

function isNewsletterTableUnavailable(error: {
  message?: string;
  code?: string;
}): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    (m.includes("could not find the table") && m.includes("newsletter_inscricoes")) ||
    (m.includes("schema cache") && m.includes("newsletter_inscricoes"))
  );
}

export async function insertNewsletterInscricao(params: {
  email: string;
  nome: string | null;
  origem?: string;
}): Promise<"created" | "already_exists"> {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("newsletter_inscricoes")
    .select("id")
    .eq("email", params.email)
    .maybeSingle();

  if (existing) return "already_exists";

  const { error } = await supabase.from("newsletter_inscricoes").insert({
    email: params.email,
    nome: params.nome,
    origem: params.origem ?? "home",
  });

  if (error) {
    if (error.code === "23505") return "already_exists";
    if (isNewsletterTableUnavailable(error)) {
      throw new Error(
        "Newsletter indisponível: execute a migration 011_newsletter_inscricoes.sql no Supabase."
      );
    }
    throw error;
  }

  return "created";
}

export async function listNewsletterInscricoesAdmin(): Promise<NewsletterInscricaoRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("newsletter_inscricoes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isNewsletterTableUnavailable(error)) {
      console.warn("listNewsletterInscricoesAdmin: tabela indisponível.");
      return [];
    }
    throw error;
  }

  return (data ?? []) as NewsletterInscricaoRow[];
}

export async function deleteNewsletterInscricaoAdmin(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("newsletter_inscricoes").delete().eq("id", id);
  if (error) throw error;
  return true;
}
