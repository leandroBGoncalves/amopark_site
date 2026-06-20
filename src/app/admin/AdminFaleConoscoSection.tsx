"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Inbox,
  Loader2,
  Mail,
  MessageSquareWarning,
  Send,
  Trash2,
} from "lucide-react";
import type {
  FaleConoscoMensagemRow,
  FaleConoscoStatus,
} from "@/lib/fale-conosco-types";
import {
  FALE_CONOSCO_STATUS_LABELS,
  FALE_CONOSCO_STATUS_VALUES,
  FALE_CONOSCO_TIPO_LABELS,
} from "@/lib/fale-conosco-types";
import { cn } from "@/lib/utils";

type FilterStatus = "todos" | FaleConoscoStatus;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: FaleConoscoStatus): string {
  switch (status) {
    case "novo":
      return "bg-amopark-orange/15 text-amopark-orange";
    case "em_analise":
      return "bg-amopark-purple/15 text-amopark-purple";
    case "respondido":
      return "bg-amopark-green/15 text-amopark-green";
    case "arquivado":
      return "bg-amopark-charcoal/10 text-amopark-charcoal/70";
  }
}

export function AdminFaleConoscoSection() {
  const [rows, setRows] = useState<FaleConoscoMensagemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftResposta, setDraftResposta] = useState<Record<string, string>>({});
  const [draftStatus, setDraftStatus] = useState<Record<string, FaleConoscoStatus>>({});
  const [notifyOnSave, setNotifyOnSave] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/admin/fale-conosco?r=${Date.now()}`, {
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
    const em_analise = rows.filter((r) => r.status === "em_analise").length;
    const respondido = rows.filter((r) => r.status === "respondido").length;
    const arquivado = rows.filter((r) => r.status === "arquivado").length;
    return { novo, em_analise, respondido, arquivado, todos: rows.length };
  }, [rows]);

  function openRow(m: FaleConoscoMensagemRow) {
    setExpandedId(m.id);
    setDraftResposta((prev) => ({
      ...prev,
      [m.id]: prev[m.id] ?? m.resposta ?? "",
    }));
    setDraftStatus((prev) => ({
      ...prev,
      [m.id]: prev[m.id] ?? m.status,
    }));
    setNotifyOnSave((prev) => ({
      ...prev,
      [m.id]: prev[m.id] ?? true,
    }));
  }

  async function handleSave(id: string) {
    setBusyId(id);
    setMsg(null);
    setErr(null);
    const status = draftStatus[id];
    const resposta = draftResposta[id] ?? "";
    const notify = notifyOnSave[id] ?? false;

    try {
      const res = await fetch(`/api/admin/fale-conosco/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resposta: resposta.trim() || null,
          notify,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao salvar."
        );
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? (data as FaleConoscoMensagemRow) : r))
      );
      if (notify && data.emailSent === false) {
        setMsg("Salvo, mas o e-mail de atualização não foi enviado (verifique SMTP).");
      } else if (notify) {
        setMsg("Salvo e morador notificado por e-mail.");
      } else {
        setMsg("Alterações salvas.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir a mensagem de "${nome}" (protocolo)?`)) return;
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/fale-conosco/${id}`, { method: "DELETE" });
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
    { key: "em_analise", label: "Em análise", count: counts.em_analise },
    { key: "respondido", label: "Respondidas", count: counts.respondido },
    { key: "arquivado", label: "Arquivadas", count: counts.arquivado },
  ];

  return (
    <div className="mt-10 border-t border-amopark-gray-light pt-10">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-amopark-charcoal">
          <MessageSquareWarning className="h-5 w-5 text-amopark-purple" />
          Ouvidoria — sugestões, reclamações e dúvidas
        </h2>
        <p className="mt-1 text-sm text-amopark-charcoal/70">
          Envios do formulário em /fale-conosco. Responda aqui e marque para avisar o morador por
          e-mail. Ao arquivar, o link de acompanhamento do morador é revogado automaticamente.
        </p>
      </div>

      {msg && (
        <p className="mt-4 rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-sm text-amopark-charcoal">
          {msg}
        </p>
      )}
      {err && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-amopark-purple text-white"
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
          Carregando ouvidoria…
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-amopark-gray-light py-12 text-center text-sm text-amopark-charcoal/60">
          {rows.length === 0
            ? "Nenhuma mensagem ainda. Execute a migration 015_fale_conosco.sql no Supabase se o formulário retornar erro."
            : "Nenhuma mensagem neste filtro."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
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
                    if (open) {
                      setExpandedId(null);
                    } else {
                      openRow(m);
                    }
                  }}
                  className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amopark-blue">
                        {m.protocolo}
                      </span>
                      <span className="rounded-full bg-amopark-gray-light/80 px-2 py-0.5 text-xs font-medium text-amopark-charcoal/80">
                        {FALE_CONOSCO_TIPO_LABELS[m.tipo]}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusBadgeClass(m.status)
                        )}
                      >
                        {FALE_CONOSCO_STATUS_LABELS[m.status]}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-amopark-charcoal">{m.nome}</p>
                    <p className="text-sm text-amopark-charcoal/70">{m.email}</p>
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

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-amopark-charcoal/70">
                          Status
                        </label>
                        <select
                          value={draftStatus[m.id] ?? m.status}
                          disabled={busy}
                          onChange={(e) =>
                            setDraftStatus((prev) => ({
                              ...prev,
                              [m.id]: e.target.value as FaleConoscoStatus,
                            }))
                          }
                          className="mt-1 w-full max-w-xs rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                        >
                          {FALE_CONOSCO_STATUS_VALUES.map((s) => (
                            <option key={s} value={s}>
                              {FALE_CONOSCO_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-amopark-charcoal/70">
                          Resposta da AMOPARK (visível no e-mail ao morador)
                        </label>
                        <textarea
                          rows={4}
                          disabled={busy}
                          value={draftResposta[m.id] ?? m.resposta ?? ""}
                          onChange={(e) =>
                            setDraftResposta((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          placeholder="Escreva a resposta ou orientação para o morador…"
                          className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                        />
                        {m.resposta_at && (
                          <p className="mt-1 text-xs text-amopark-charcoal/50">
                            Última resposta em {formatDateTime(m.resposta_at)}
                          </p>
                        )}
                      </div>

                      <label className="flex items-center gap-2 text-sm text-amopark-charcoal">
                        <input
                          type="checkbox"
                          checked={notifyOnSave[m.id] ?? true}
                          disabled={busy}
                          onChange={(e) =>
                            setNotifyOnSave((prev) => ({
                              ...prev,
                              [m.id]: e.target.checked,
                            }))
                          }
                          className="rounded border-amopark-gray-light"
                        />
                        <Mail className="h-4 w-4 text-amopark-blue" />
                        Enviar e-mail de atualização ao morador
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSave(m.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amopark-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Salvar
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(m.id, m.nome)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setDraftStatus((prev) => ({
                              ...prev,
                              [m.id]: "arquivado",
                            }));
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-amopark-gray-light px-3 py-1.5 text-xs font-medium hover:bg-amopark-gray-light/50 disabled:opacity-50"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Marcar arquivada
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && counts.novo > 0 && filter !== "novo" && (
        <p className="mt-4 flex items-center gap-2 text-sm text-amopark-orange">
          <Inbox className="h-4 w-4" />
          {counts.novo} nova{counts.novo !== 1 ? "s" : ""} aguardando análise
        </p>
      )}
    </div>
  );
}
