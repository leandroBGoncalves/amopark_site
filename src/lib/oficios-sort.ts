import type { OficioRecord } from "./oficios-types";

/**
 * Ordenação para exibição: mais recente primeiro.
 * Usa `data_oficio` quando existir; senão `created_at` (publicação).
 * Em empate, desempata por data de publicação (mais recente primeiro).
 */
function effectiveTimeMs(o: OficioRecord): number {
  if (o.dataOficio && /^\d{4}-\d{2}-\d{2}$/.test(o.dataOficio)) {
    const [y, m, d] = o.dataOficio.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  return new Date(o.createdTime).getTime();
}

export function compareOficiosNewestFirst(a: OficioRecord, b: OficioRecord): number {
  const ta = effectiveTimeMs(a);
  const tb = effectiveTimeMs(b);
  if (tb !== ta) return tb - ta;
  return (
    new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
  );
}

export function sortOficiosChronologically(records: OficioRecord[]): OficioRecord[] {
  return [...records].sort(compareOficiosNewestFirst);
}

/** Ano de referência para filtro: data do ofício ou ano de publicação. */
export function oficioReferenceYear(o: OficioRecord): number {
  if (o.dataOficio && /^\d{4}/.test(o.dataOficio)) {
    return parseInt(o.dataOficio.slice(0, 4), 10);
  }
  return new Date(o.createdTime).getFullYear();
}
