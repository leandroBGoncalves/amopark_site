"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Trash2, Users } from "lucide-react";
import type { NewsletterInscricaoRow } from "@/lib/newsletter-db";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminNewsletterSection() {
  const [rows, setRows] = useState<NewsletterInscricaoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/admin/newsletter?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao listar inscrições."
        );
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar newsletter.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remover a inscrição de ${email}?`)) return;
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao remover."
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setMsg("Inscrição removida.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao remover.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-10 border-t border-amopark-gray-light pt-10">
      <h3 className="flex items-center gap-2 text-base font-semibold text-amopark-charcoal">
        <Users className="h-5 w-5 text-amopark-purple" />
        Newsletter
        {!loading && (
          <span className="rounded-full bg-amopark-purple/10 px-2 py-0.5 text-xs font-medium text-amopark-purple">
            {rows.length}
          </span>
        )}
      </h3>
      <p className="mt-1 text-sm text-amopark-charcoal/70">
        Inscrições pelo CTA da home
      </p>

      {msg && (
        <p className="mt-3 rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-sm">
          {msg}
        </p>
      )}
      {err && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-amopark-charcoal/50" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-amopark-gray-light py-8 text-center text-sm text-amopark-charcoal/60">
          Nenhuma inscrição ainda. Execute a migration 011_newsletter_inscricoes.sql se o
          formulário da home retornar erro.
        </p>
      ) : (
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amopark-gray-light bg-amopark-gray-light/20 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium text-amopark-charcoal truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-amopark-blue" />
                  {r.email}
                </p>
                {r.nome && (
                  <p className="text-xs text-amopark-charcoal/65">{r.nome}</p>
                )}
                <p className="text-xs text-amopark-charcoal/50">
                  {formatDateTime(r.created_at)} · {r.origem}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => handleDelete(r.id, r.email)}
                className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
