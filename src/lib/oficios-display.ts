/** Formata data para listas/cards: `data_oficio` (YYYY-MM-DD) ou ISO de `created_at`. */
export function formatOficioListDate(
  dataOficio: string | null | undefined,
  createdTime: string
): string {
  const raw = dataOficio?.trim();
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  try {
    return new Date(createdTime).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return createdTime;
  }
}

/** Formata para tabela home (dd/mm/aaaa). */
export function formatOficioTableDate(
  dataOficio: string | null | undefined,
  createdTime: string
): string {
  const raw = dataOficio?.trim();
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  try {
    return new Date(createdTime).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return createdTime;
  }
}
