"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  List,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { OficioCard } from "@/components/OficioCard";
import { OficiosListView } from "@/components/OficiosListView";
import type { OficioRecord } from "@/lib/oficios-types";
import {
  STATUS_QUICK_FILTERS,
  countByStatusFilter,
  filterOficios,
  groupOficiosByYear,
  uniqueDestinatarios,
  type OficioStatusFilter,
} from "@/lib/oficios-filters";
import { oficioReferenceYear, sortOficiosChronologically } from "@/lib/oficios-sort";
import { cn } from "@/lib/utils";

type ViewMode = "cards" | "lista";

export function TransparenciaClient() {
  const [oficios, setOficios] = useState<OficioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OficioStatusFilter>("");
  const [destinatario, setDestinatario] = useState("");
  const [view, setView] = useState<ViewMode>("lista");
  const [helpOpen, setHelpOpen] = useState(false);

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

  const destinatarioOptions = useMemo(
    () => uniqueDestinatarios(oficios),
    [oficios]
  );

  const filtered = useMemo(
    () =>
      filterOficios(oficios, {
        year,
        search,
        status: statusFilter,
        destinatario,
      }),
    [oficios, year, search, statusFilter, destinatario]
  );

  const grouped = useMemo(() => groupOficiosByYear(filtered), [filtered]);

  const hasFilters = Boolean(
    year || search.trim() || statusFilter || destinatario
  );
  const total = oficios.length;
  const shown = filtered.length;
  const showYearSections = !year && shown > 0 && grouped.length > 1;

  const stats = useMemo(() => {
    const comResposta = countByStatusFilter(oficios, "com_resposta");
    const aguardando = countByStatusFilter(oficios, "aguardando");
    return { comResposta, aguardando };
  }, [oficios]);

  function clearFilters() {
    setYear("");
    setSearch("");
    setStatusFilter("");
    setDestinatario("");
  }

  function renderOficiosList(list: OficioRecord[]) {
    if (view === "lista") {
      return <OficiosListView oficios={list} />;
    }
    return (
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {list.map((o) => (
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
    );
  }

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 py-12 text-amopark-charcoal/70">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Carregando ofícios...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-amopark-blue/20 bg-amopark-blue/5 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-amopark-charcoal">
            <HelpCircle className="h-5 w-5 text-amopark-blue" />
            Como encontrar um ofício?
          </span>
          <span className="text-xs text-amopark-blue">
            {helpOpen ? "Ocultar" : "Ver dicas"}
          </span>
        </button>
        {helpOpen && (
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-amopark-charcoal/85">
            <li>
              Use a <strong>busca</strong> com palavras do assunto, nome da prefeitura,
              bairro ou o <strong>número do ofício</strong> (ex.: OF-2025-012).
            </li>
            <li>
              Filtre por <strong>ano</strong> se souber quando foi enviado.
            </li>
            <li>
              Escolha a <strong>situação</strong>: aguardando resposta, já respondido, etc.
            </li>
            <li>
              A visualização em <strong>lista</strong> mostra tudo em uma tabela; em{" "}
              <strong>cards</strong>, cada ofício aparece em um bloco maior.
            </li>
            <li>
              Clique em <strong>Abrir documento</strong> para ler o PDF ou arquivo
              completo.
            </li>
          </ul>
        )}
      </div>

      {total > 0 && (
        <>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg border border-amopark-gray-light bg-white px-3 py-2 font-medium text-amopark-charcoal">
              {total} ofício{total !== 1 ? "s" : ""} no total
            </span>
            <span className="rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-amopark-green">
              {stats.comResposta} com resposta
            </span>
            <span className="rounded-lg border border-amopark-orange/30 bg-amopark-orange/10 px-3 py-2 text-amopark-orange">
              {stats.aguardando} aguardando
            </span>
          </div>

          <div className="rounded-xl border border-amopark-gray-light bg-white p-4 shadow-sm sm:p-5">
            <label htmlFor="transp-search-main" className="text-sm font-semibold text-amopark-charcoal">
              Buscar ofício
            </label>
            <p className="mt-0.5 text-xs text-amopark-charcoal/60">
              Digite qualquer palavra que lembre o assunto, o destino ou o número
            </p>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amopark-blue/50" />
              <input
                id="transp-search-main"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex.: iluminação, prefeitura, drenagem, OF-2025..."
                className="w-full rounded-xl border-2 border-amopark-gray-light py-3 pl-12 pr-10 text-base text-amopark-charcoal placeholder:text-amopark-charcoal/40 focus:border-amopark-blue focus:outline-none focus:ring-2 focus:ring-amopark-blue/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-amopark-charcoal/50 hover:bg-amopark-gray-light"
                  aria-label="Limpar busca"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-amopark-charcoal/80">Situação</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_QUICK_FILTERS.map((f) => {
                  const n = countByStatusFilter(oficios, f.id);
                  if (f.id && n === 0) return null;
                  const active = statusFilter === f.id;
                  return (
                    <button
                      key={f.id || "all"}
                      type="button"
                      title={f.hint}
                      onClick={() => setStatusFilter(f.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-amopark-blue text-white shadow-sm"
                          : "border border-amopark-gray-light bg-amopark-gray-light/40 text-amopark-charcoal hover:border-amopark-blue/30"
                      )}
                    >
                      {f.label}
                      <span className={cn("ml-1.5 tabular-nums", active ? "text-white/90" : "text-amopark-charcoal/50")}>
                        ({n})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="transp-year" className="text-xs font-medium text-amopark-charcoal/80">
                  Ano
                </label>
                <select
                  id="transp-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2.5 text-sm text-amopark-charcoal"
                >
                  <option value="">Todos os anos</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {destinatarioOptions.length > 0 && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="transp-dest"
                    className="text-xs font-medium text-amopark-charcoal/80"
                  >
                    Enviado para (órgão / empresa)
                  </label>
                  <select
                    id="transp-dest"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2.5 text-sm text-amopark-charcoal"
                  >
                    <option value="">Todos</option>
                    {destinatarioOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-amopark-charcoal/80">
                  Visualização
                </span>
                <div className="mt-1 flex rounded-lg border border-amopark-gray-light p-1">
                  <button
                    type="button"
                    onClick={() => setView("lista")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium sm:text-sm",
                      view === "lista"
                        ? "bg-amopark-blue text-white"
                        : "text-amopark-charcoal/70 hover:bg-amopark-gray-light/60"
                    )}
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("cards")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium sm:text-sm",
                      view === "cards"
                        ? "bg-amopark-blue text-white"
                        : "text-amopark-charcoal/70 hover:bg-amopark-gray-light/60"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-amopark-blue hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </>
      )}

      <p className="text-sm text-amopark-charcoal/70">
        {total === 0
          ? "Nenhum ofício publicado no mural. A diretoria pode enviar documentos pelo painel administrativo."
          : hasFilters
            ? `Encontrados ${shown} de ${total} ofício(s) · mais recentes primeiro.`
            : `${total} ofício(s) · mais recentes primeiro.`}
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
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
        <div className="rounded-xl border border-amopark-gray-light bg-amopark-gray-light/30 p-12 text-center">
          <p className="text-amopark-charcoal/80">
            Nenhum ofício encontrado com esses filtros.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white"
          >
            Ver todos os ofícios
          </button>
        </div>
      ) : showYearSections ? (
        <div className="space-y-10">
          {grouped.map(({ year: y, items }) => (
            <section key={y}>
              <h2 className="mb-4 border-b border-amopark-gray-light pb-2 text-lg font-bold text-amopark-charcoal">
                Ofícios de {y}
                <span className="ml-2 text-sm font-normal text-amopark-charcoal/60">
                  ({items.length})
                </span>
              </h2>
              {renderOficiosList(items)}
            </section>
          ))}
        </div>
      ) : (
        renderOficiosList(filtered)
      )}
    </div>
  );
}
