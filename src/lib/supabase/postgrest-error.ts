/** Mensagem legível a partir do objeto de erro do PostgREST / Supabase. */
export function formatPostgrestError(e: {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}): string {
  const parts: string[] = [];
  if (typeof e.message === "string" && e.message.trim()) {
    parts.push(e.message.trim());
  }
  if (typeof e.details === "string" && e.details.trim()) {
    parts.push(e.details.trim());
  }
  if (typeof e.hint === "string" && e.hint.trim()) {
    parts.push(`Dica: ${e.hint.trim()}`);
  }
  if (typeof e.code === "string" && e.code.trim() && e.code !== "PGRST116") {
    parts.push(`[${e.code.trim()}]`);
  }
  return parts.length > 0
    ? parts.join(" — ")
    : "Falha na operação no Supabase (sem detalhe retornado).";
}

export function toApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (err && typeof err === "object" && "message" in err) {
    return formatPostgrestError(err as Parameters<typeof formatPostgrestError>[0]);
  }
  return fallback;
}
