import type { EventoListItem } from "./eventos-types";

/** YYYY-MM-DD no fuso local (evita deslocar o dia com UTC). */
export function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Aceita YYYY-MM-DD ou ISO com horário (Postgres/JSON). */
export function normalizeEventDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : trimmed.slice(0, 10);
}

export function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const norm = normalizeEventDate(iso);
  const [ys, ms, ds] = norm.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

/** Mês inicial: próximo evento ou primeiro da lista; senão mês de hoje. */
export function calendarInitialView(
  eventos: EventoListItem[],
  todayIso: string
): { year: number; month: number; selectedIso: string } {
  const today = parseIsoDate(todayIso);
  const fallback = today ?? { y: 2026, m: 1, d: 1 };

  if (eventos.length === 0) {
    return {
      year: fallback.y,
      month: fallback.m,
      selectedIso: todayIso,
    };
  }

  const sorted = [...eventos].sort((a, b) =>
    normalizeEventDate(a.eventDate).localeCompare(normalizeEventDate(b.eventDate))
  );
  const upcoming = sorted.find((e) => normalizeEventDate(e.eventDate) >= todayIso);
  const pick = upcoming ?? sorted[sorted.length - 1];
  const p = parseIsoDate(pick.eventDate);
  if (!p) {
    return {
      year: fallback.y,
      month: fallback.m,
      selectedIso: todayIso,
    };
  }
  return {
    year: p.y,
    month: p.m,
    selectedIso: normalizeEventDate(pick.eventDate),
  };
}

export function isoFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export type CalendarCell =
  | { kind: "empty"; key: string }
  | { kind: "day"; key: string; iso: string; day: number; isToday: boolean };

/** Grade de um mês (segunda = primeira coluna). */
export function buildMonthGrid(
  year: number,
  month: number,
  todayIso: string
): CalendarCell[] {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ kind: "empty", key: `e-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = isoFromParts(year, month, day);
    cells.push({
      kind: "day",
      key: iso,
      iso,
      day,
      isToday: iso === todayIso,
    });
  }
  return cells;
}

export function eventsByDate(
  eventos: EventoListItem[]
): Map<string, EventoListItem[]> {
  const sorted = [...eventos].sort((a, b) =>
    a.title.localeCompare(b.title, "pt-BR")
  );
  const map = new Map<string, EventoListItem[]>();
  for (const e of sorted) {
    const key = normalizeEventDate(e.eventDate);
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }
  return map;
}

export function addMonths(year: number, month: number, delta: number): {
  year: number;
  month: number;
} {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
