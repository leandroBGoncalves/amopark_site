import type { OficioRecord } from "./oficios-types";
import type { OficioStatusValue } from "./oficios-status";
import { oficioReferenceYear } from "./oficios-sort";

export type OficioStatusFilter =
  | ""
  | "aguardando"
  | "com_resposta"
  | "sem_resposta"
  | OficioStatusValue;

const AGUARDANDO: OficioStatusValue[] = ["enviado", "em_analise"];
const COM_RESPOSTA: OficioStatusValue[] = ["respondido", "atendido"];
const SEM_RESPOSTA: OficioStatusValue[] = ["nao_respondido", "nao_atendido"];

export const STATUS_QUICK_FILTERS: {
  id: OficioStatusFilter;
  label: string;
  hint: string;
}[] = [
  { id: "", label: "Todos", hint: "Ver todos os ofícios" },
  {
    id: "aguardando",
    label: "Aguardando",
    hint: "Enviados ou em análise pela outra parte",
  },
  {
    id: "com_resposta",
    label: "Com resposta",
    hint: "Já respondidos ou atendidos",
  },
  {
    id: "sem_resposta",
    label: "Sem resposta",
    hint: "Ainda sem retorno oficial",
  },
];

function matchesStatusFilter(
  status: OficioStatusValue,
  filter: OficioStatusFilter
): boolean {
  if (!filter) return true;
  if (filter === "aguardando") return AGUARDANDO.includes(status);
  if (filter === "com_resposta") return COM_RESPOSTA.includes(status);
  if (filter === "sem_resposta") return SEM_RESPOSTA.includes(status);
  return status === filter;
}

export function filterOficios(
  oficios: OficioRecord[],
  opts: {
    year: string;
    search: string;
    status: OficioStatusFilter;
    destinatario: string;
  }
): OficioRecord[] {
  let list = [...oficios];

  if (opts.year) {
    const y = parseInt(opts.year, 10);
    if (!Number.isNaN(y)) {
      list = list.filter((o) => oficioReferenceYear(o) === y);
    }
  }

  if (opts.destinatario) {
    list = list.filter(
      (o) => (o.destinatario ?? "").trim() === opts.destinatario
    );
  }

  if (opts.status) {
    list = list.filter((o) => matchesStatusFilter(o.status, opts.status));
  }

  const q = opts.search.trim().toLowerCase();
  if (q) {
    list = list.filter((o) => {
      const hay = [
        o.name,
        o.summary,
        o.numeroOficio ?? "",
        o.destinatario ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return list;
}

export function countByStatusFilter(
  oficios: OficioRecord[],
  filter: OficioStatusFilter
): number {
  return filterOficios(oficios, {
    year: "",
    search: "",
    status: filter,
    destinatario: "",
  }).length;
}

/** Agrupa por ano (mais recente primeiro) para exibição em seções. */
export function groupOficiosByYear(
  oficios: OficioRecord[]
): { year: number; items: OficioRecord[] }[] {
  const map = new Map<number, OficioRecord[]>();
  for (const o of oficios) {
    const y = oficioReferenceYear(o);
    const arr = map.get(y) ?? [];
    arr.push(o);
    map.set(y, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
}

export function uniqueDestinatarios(oficios: OficioRecord[]): string[] {
  const set = new Set<string>();
  for (const o of oficios) {
    const d = o.destinatario?.trim();
    if (d) set.add(d);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
