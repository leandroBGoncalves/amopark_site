"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { OficioCard } from "@/components/OficioCard";
import type { OficioRecord } from "@/lib/oficios-types";
import {
  oficioReferenceYear,
  sortOficiosChronologically,
} from "@/lib/oficios-sort";

export function TransparenciaClient() {
  const [oficios, setOficios] = useState<OficioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("");
  const [search, setSearch] = useState("");

  const fetchOficios = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    setError(null);
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/oficios?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: string }).error === "string"
            ? (data as { error: string }).error
            : "Falha ao carregar ofícios.";
        throw new Error(msg);
      }
      const list = Array.isArray(data) ? data : [];
      setOficios(sortOficiosChronologically(list as OficioRecord[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOficios();
  }, [fetchOficios]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") fetchOficios({ silent: true });
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchOficios]);

  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    for (const o of oficios) {
      ys.add(oficioReferenceYear(o));
    }
    return Array.from(ys).sort((a, b) => b - a);
  }, [oficios]);

  const filtered = useMemo(() => {
    let list = [...oficios];

    if (year) {
      const y = parseInt(year, 10);
      if (!Number.isNaN(y)) {
        list = list.filter((o) => oficioReferenceYear(o) === y);
      }
    }

    const q = search.trim().toLowerCase();
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
  }, [oficios, year, search]);

  const hasFilters = Boolean(year || search.trim());
  const total = oficios.length;
  const shown = filtered.length;

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 py-12 text-amopark-charcoal/70">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Carregando ofícios...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {total > 0 && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-amopark-gray-light bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[10rem] flex-1 sm:max-w-xs">
            <label
              htmlFor="transp-year"
              className="block text-xs font-medium text-amopark-charcoal/80"
            >
              Ano
            </label>
            <select
              id="transp-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm text-amopark-charcoal"
            >
              <option value="">Todos os anos</option>
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[12rem] flex-[2]">
            <label
              htmlFor="transp-search"
              className="block text-xs font-medium text-amopark-charcoal/80"
            >
              Buscar por texto
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amopark-charcoal/40" />
              <input
                id="transp-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título, resumo, nº ou destino…"
                className="w-full rounded-lg border border-amopark-gray-light py-2 pl-9 pr-3 text-sm text-amopark-charcoal placeholder:text-amopark-charcoal/40"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setYear("");
                setSearch("");
              }}
              className="rounded-lg border border-amopark-gray-light px-3 py-2 text-sm font-medium text-amopark-charcoal hover:bg-amopark-gray-light sm:mb-0.5"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <p className="mb-6 text-sm text-amopark-charcoal/70">
        {total === 0
          ? "Nenhum ofício publicado no mural. A diretoria pode enviar documentos pelo painel administrativo."
          : hasFilters
            ? `Mostrando ${shown} de ${total} ofício(s) · ordem: mais recentes primeiro.`
            : `${total} ofício(s) · ordem cronológica (mais recentes primeiro).`}
      </p>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {total === 0 && !error ? (
        <div className="rounded-xl border border-amopark-gray-light bg-amopark-gray-light/30 p-12 text-center text-amopark-charcoal/70">
          Em breve haverá ofícios e solicitações publicados aqui. A publicação é feita pela
          equipe da AMOPARK pelo painel administrativo.
        </div>
      ) : shown === 0 && hasFilters ? (
        <div className="rounded-xl border border-amopark-gray-light bg-amopark-gray-light/30 p-12 text-center text-sm text-amopark-charcoal/70">
          Nenhum ofício corresponde aos filtros. Tente outro ano ou termo de busca.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((o) => (
            <OficioCard
              key={o.id}
              title={o.name}
              createdTime={o.createdTime}
              dataOficio={o.dataOficio}
              summary={o.summary}
              numeroOficio={o.numeroOficio}
              destinatario={o.destinatario}
              status={o.status}
              webViewLink={o.webViewLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
