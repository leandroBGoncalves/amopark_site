"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Check,
  Inbox,
  Loader2,
  Mail,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { ContatoMensagemRow, ContatoStatus } from "@/lib/contato-types";
import { CONTATO_STATUS_LABELS } from "@/lib/contato-types";
import { cn } from "@/lib/utils";

type FilterStatus = "todos" | ContatoStatus;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: ContatoStatus): string {
  switch (status) {
    case "novo":
      return "bg-amopark-orange/15 text-amopark-orange";
    case "lido":
      return "bg-amopark-blue/10 text-amopark-blue";
    case "arquivado":
      return "bg-amopark-charcoal/10 text-amopark-charcoal/70";
  }
}

export function AdminContatoSection({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<ContatoMensagemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/admin/contato?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao listar mensagens."
        );
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "todos") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const counts = useMemo(() => {
    const novo = rows.filter((r) => r.status === "novo").length;
    const lido = rows.filter((r) => r.status === "lido").length;
    const arquivado = rows.filter((r) => r.status === "arquivado").length;
    return { novo, lido, arquivado, todos: rows.length };
  }, [rows]);

  async function setStatus(id: string, status: ContatoStatus) {
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/contato/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao atualizar."
        );
      }
      setRows((prev) => prev.map((r) => (r.id === id ? (data as ContatoMensagemRow) : r)));
      setMsg("Status atualizado.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir a mensagem de "${nome}"?`)) return;
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/contato/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao excluir."
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
      setMsg("Mensagem excluída.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setBusyId(null);
    }
  }

  const filters: { key: FilterStatus; label: string; count: number }[] = [
    { key: "todos", label: "Todas", count: counts.todos },
    { key: "novo", label: "Novas", count: counts.novo },
    { key: "lido", label: "Lidas", count: counts.lido },
    { key: "arquivado", label: "Arquivadas", count: counts.arquivado },
  ];

  return (
    <div className={cn(!embedded && "space-y-6")}>
      {!embedded && (
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amopark-charcoal">
            <Mail className="h-5 w-5 text-amopark-blue" />
            Mensagens de contato
          </h2>
          <p className="mt-1 text-sm text-amopark-charcoal/70">
            Envios do formulário público em /contato
          </p>
        </div>
      )}

      {msg && (
        <p className="rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-sm text-amopark-charcoal">
          {msg}
        </p>
      )}
      {err && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-amopark-blue text-white"
                : "bg-amopark-gray-light/80 text-amopark-charcoal/80 hover:bg-amopark-gray-light"
            )}
          >
            {f.label}
            {f.count > 0 && (
              <span className="ml-1 opacity-80">({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-amopark-charcoal/70">
          <Loader2 className="h-10 w-10 animate-spin" />
          Carregando mensagens…
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-amopark-gray-light py-12 text-center text-sm text-amopark-charcoal/60">
          {rows.length === 0
            ? "Nenhuma mensagem ainda. Execute a migration 010_contato_mensagens.sql no Supabase se o formulário retornar erro."
            : "Nenhuma mensagem neste filtro."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => {
            const open = expandedId === m.id;
            const busy = busyId === m.id;
            return (
              <li
                key={m.id}
                className={cn(
                  "rounded-xl border bg-white shadow-sm transition-colors",
                  m.status === "novo"
                    ? "border-amopark-orange/40"
                    : "border-amopark-gray-light"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedId(open ? null : m.id);
                    if (m.status === "novo" && !open) {
                      void setStatus(m.id, "lido");
                    }
                  }}
                  className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-amopark-charcoal">{m.nome}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusBadgeClass(m.status)
                        )}
                      >
                        {CONTATO_STATUS_LABELS[m.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-amopark-charcoal/70">{m.email}</p>
                    {m.assunto && (
                      <p className="mt-1 text-sm font-medium text-amopark-charcoal line-clamp-1">
                        {m.assunto}
                      </p>
                    )}
                    {!open && (
                      <p className="mt-1 text-sm text-amopark-charcoal/60 line-clamp-2">
                        {m.mensagem}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-amopark-charcoal/50">
                    {formatDateTime(m.created_at)}
                  </time>
                </button>

                {open && (
                  <div className="border-t border-amopark-gray-light px-4 pb-4">
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {m.telefone && (
                        <div>
                          <dt className="text-amopark-charcoal/50">Telefone</dt>
                          <dd className="text-amopark-charcoal">{m.telefone}</dd>
                        </div>
                      )}
                      {m.assunto && (
                        <div className="sm:col-span-2">
                          <dt className="text-amopark-charcoal/50">Assunto</dt>
                          <dd className="text-amopark-charcoal">{m.assunto}</dd>
                        </div>
                      )}
                    </dl>
                    <p className="mt-3 whitespace-pre-wrap rounded-lg bg-amopark-gray-light/40 p-3 text-sm text-amopark-charcoal">
                      {m.mensagem}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.status !== "lido" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(m.id, "lido")}
                          className="inline-flex items-center gap-1 rounded-lg border border-amopark-gray-light px-3 py-1.5 text-xs font-medium hover:bg-amopark-gray-light/50 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Marcar lida
                        </button>
                      )}
                      {m.status !== "arquivado" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(m.id, "arquivado")}
                          className="inline-flex items-center gap-1 rounded-lg border border-amopark-gray-light px-3 py-1.5 text-xs font-medium hover:bg-amopark-gray-light/50 disabled:opacity-50"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Arquivar
                        </button>
                      )}
                      {m.status !== "novo" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(m.id, "novo")}
                          className="inline-flex items-center gap-1 rounded-lg border border-amopark-gray-light px-3 py-1.5 text-xs font-medium hover:bg-amopark-gray-light/50 disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Marcar nova
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(m.id, m.nome)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && counts.novo > 0 && filter !== "novo" && (
        <p className="flex items-center gap-2 text-sm text-amopark-orange">
          <Inbox className="h-4 w-4" />
          {counts.novo} nova{counts.novo !== 1 ? "s" : ""} aguardando leitura
        </p>
      )}
    </div>
  );
}
