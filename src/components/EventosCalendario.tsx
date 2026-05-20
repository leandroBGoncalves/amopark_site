"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventoListItem } from "@/lib/eventos-types";
import {
  addMonths,
  buildMonthGrid,
  eventsByDate,
  monthLabel,
  normalizeEventDate,
  parseIsoDate,
  todayIsoLocal,
} from "@/lib/evento-calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function EventosCalendario({
  eventos,
  initialYear,
  initialMonth,
  initialSelectedIso,
  className,
}: {
  eventos: EventoListItem[];
  initialYear: number;
  initialMonth: number;
  initialSelectedIso: string;
  className?: string;
}) {
  const todayIso = todayIsoLocal();
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [selectedIso, setSelectedIso] = useState(initialSelectedIso);

  const byDate = useMemo(() => eventsByDate(eventos), [eventos]);
  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, todayIso),
    [viewYear, viewMonth, todayIso]
  );

  const selectedKey = selectedIso ? normalizeEventDate(selectedIso) : null;
  const selectedEvents = selectedKey ? (byDate.get(selectedKey) ?? []) : [];
  const monthEventCount = useMemo(() => {
    let n = 0;
    for (const cell of grid) {
      if (cell.kind === "day" && (byDate.get(cell.iso)?.length ?? 0) > 0) n += 1;
    }
    return n;
  }, [grid, byDate]);

  function goMonth(delta: number) {
    const next = addMonths(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  function goToday() {
    const t = parseIsoDate(todayIso);
    if (!t) return;
    setViewYear(t.y);
    setViewMonth(t.m);
    setSelectedIso(todayIso);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-amopark-gray-light bg-white p-4 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold capitalize text-amopark-charcoal">
            {monthLabel(viewYear, viewMonth)}
          </h2>
          {monthEventCount > 0 && (
            <p className="mt-0.5 text-xs text-amopark-charcoal/60">
              {monthEventCount} dia{monthEventCount !== 1 ? "s" : ""} com evento neste mês
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="rounded-lg border border-amopark-gray-light p-2 hover:bg-amopark-gray-light/50"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-amopark-gray-light px-3 py-2 text-xs font-medium text-amopark-charcoal hover:bg-amopark-gray-light/50"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="rounded-lg border border-amopark-gray-light p-2 hover:bg-amopark-gray-light/50"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-amopark-charcoal/60">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
        {grid.map((cell) => {
          if (cell.kind === "empty") {
            return <div key={cell.key} className="min-h-[3.25rem] sm:min-h-[4rem]" aria-hidden />;
          }
          const dayEvents = byDate.get(cell.iso) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedKey === cell.iso;
          const firstTitle = dayEvents[0]?.title ?? "";

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedIso(cell.iso)}
              className={cn(
                "relative flex min-h-[3.25rem] flex-col items-stretch rounded-lg border px-0.5 py-1 text-left transition-colors sm:min-h-[4rem] sm:px-1",
                hasEvents &&
                  !isSelected &&
                  "border-amopark-orange/50 bg-amopark-orange/10 hover:bg-amopark-orange/20",
                !hasEvents &&
                  !isSelected &&
                  "border-transparent text-amopark-charcoal hover:bg-amopark-gray-light/60",
                isSelected &&
                  "border-amopark-blue bg-amopark-blue text-white ring-2 ring-amopark-blue/30",
                !isSelected && cell.isToday && !hasEvents && "bg-amopark-orange/15 font-semibold"
              )}
              aria-label={
                hasEvents
                  ? `${cell.day}: ${dayEvents.map((e) => e.title).join(", ")}`
                  : `Dia ${cell.day}`
              }
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "text-center text-sm font-semibold leading-none",
                  isSelected ? "text-white" : "text-amopark-charcoal"
                )}
              >
                {cell.day}
              </span>
              {hasEvents && (
                <span
                  className={cn(
                    "mt-1 line-clamp-2 text-center text-[10px] font-medium leading-tight sm:text-[11px]",
                    isSelected ? "text-white/95" : "text-amopark-orange"
                  )}
                  title={firstTitle}
                >
                  {firstTitle}
                  {dayEvents.length > 1 ? ` +${dayEvents.length - 1}` : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-[4rem] border-t border-amopark-gray-light pt-4">
        {selectedIso ? (
          <>
            <p className="text-sm font-medium text-amopark-charcoal">
              {formatSelectedDate(selectedIso)}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="mt-2 text-sm text-amopark-charcoal/60">
                Nenhum evento nesta data.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/eventos/${e.slug}`}
                      className="block rounded-lg border border-amopark-gray-light px-3 py-2 text-sm transition-colors hover:border-amopark-blue/40 hover:bg-amopark-blue/5"
                    >
                      <span className="font-medium text-amopark-charcoal">{e.title}</span>
                      {e.timeNote && (
                        <span className="mt-0.5 block text-xs text-amopark-charcoal/60">
                          {e.timeNote}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-amopark-charcoal/60">
            Clique em um dia com destaque laranja para ver os eventos.
          </p>
        )}
      </div>
    </div>
  );
}

function formatSelectedDate(iso: string): string {
  const p = parseIsoDate(iso);
  if (!p) return iso;
  return new Date(p.y, p.m - 1, p.d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
