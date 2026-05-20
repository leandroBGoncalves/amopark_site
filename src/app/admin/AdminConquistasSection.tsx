"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Info,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import type { ConquistaRecord } from "@/lib/conquistas-types";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { value: 0, label: "Vermelho" },
  { value: 1, label: "Laranja" },
  { value: 2, label: "Roxo" },
  { value: 3, label: "Azul" },
  { value: 4, label: "Verde" },
  { value: 5, label: "Amarelo" },
] as const;

export function AdminConquistasSection({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [items, setItems] = useState<ConquistaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [editing, setEditing] = useState<ConquistaRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [tableSetupPending, setTableSetupPending] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  const load = useCallback(async (mode: "mount" | "recheck" = "mount") => {
    setErr(null);
    if (mode === "recheck") setRechecking(true);
    try {
      const res = await fetch(`/api/conquistas?r=${Date.now()}`, {
        cache: "no-store",
      });
      const setupPending =
        res.headers.get("X-Amopark-Conquistas-Setup") === "1";
      const data = await res.json();
      if (!res.ok) {
        const m =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: string }).error === "string"
            ? (data as { error: string }).error
            : "Falha ao listar conquistas.";
        throw new Error(m);
      }
      setItems(Array.isArray(data) ? data : []);
      setTableSetupPending(setupPending);
    } catch (e) {
      setTableSetupPending(false);
      setErr(
        e instanceof Error ? e.message : "Não foi possível carregar conquistas."
      );
    } finally {
      if (mode === "mount") setLoading(false);
      if (mode === "recheck") setRechecking(false);
    }
  }, []);

  useEffect(() => {
    load("mount");
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!title.trim()) {
      setErr("Informe o título da conquista.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/conquistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date_label: dateLabel.trim() || null,
          color_index: colorIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao salvar.");
        return;
      }
      setMsg("Conquista publicada na home.");
      setTitle("");
      setDescription("");
      setDateLabel("");
      setColorIndex(0);
      await load();
    } catch {
      setErr("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, t: string) {
    if (!confirm(`Remover a conquista "${t}"?`)) return;
    setErr(null);
    try {
      const res = await fetch(`/api/admin/conquistas/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao remover.");
        return;
      }
      setMsg("Conquista removida.");
      await load();
    } catch {
      setErr("Erro ao remover.");
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget;
    const t = (form.elements.namedItem("ec_title") as HTMLInputElement).value.trim();
    if (!t) {
      setEditErr("Título é obrigatório.");
      return;
    }
    const desc = (form.elements.namedItem("ec_desc") as HTMLTextAreaElement).value;
    const dl = (form.elements.namedItem("ec_date") as HTMLInputElement).value.trim();
    const ci = parseInt(
      (form.elements.namedItem("ec_color") as HTMLSelectElement).value,
      10
    );

    setSavingEdit(true);
    setEditErr(null);
    try {
      const res = await fetch(`/api/admin/conquistas/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          description: desc,
          date_label: dl === "" ? null : dl,
          color_index: Number.isNaN(ci) ? 0 : ci,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(data.error ?? "Erro ao salvar.");
        return;
      }
      setMsg("Conquista atualizada.");
      setEditing(null);
      await load();
    } catch {
      setEditErr("Erro ao salvar.");
    } finally {
      setSavingEdit(false);
    }
  }

  const shell = cn(
    "space-y-6",
    embedded
      ? ""
      : "rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm"
  );

  if (loading) {
    return (
      <section
        className={cn(
          embedded
            ? "py-6"
            : "rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm"
        )}
      >
        <div className="flex items-center gap-2 text-amopark-charcoal/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando conquistas...
        </div>
      </section>
    );
  }

  return (
    <section className={shell}>
      <h2 className="flex items-center gap-2 font-semibold text-amopark-charcoal">
        <Trophy className="h-5 w-5 text-amopark-yellow" />
        Últimas conquistas (home e notícias)
      </h2>
      <p className="text-sm text-amopark-charcoal/70">
        As três mais recentes aparecem na página inicial; todas ficam em Notícias e Eventos.
      </p>

      {tableSetupPending && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex gap-3">
            <Info
              className="h-5 w-5 shrink-0 text-amber-700"
              aria-hidden
            />
            <div className="min-w-0 space-y-2">
              <p className="font-medium text-amber-950">
                Banco de dados: tabela ainda não disponível
              </p>
              <p className="text-amber-900/90">
                O projeto Supabase usado por este site ainda não expõe a tabela{" "}
                <code className="rounded bg-amber-100/90 px-1.5 py-0.5 text-xs">
                  public.conquistas
                </code>{" "}
                (ou o PostgREST não atualizou o cache após criá-la).
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-amber-900/85">
                <li>
                  No Supabase, abra{" "}
                  <strong>SQL Editor</strong> e execute o arquivo{" "}
                  <code className="rounded bg-amber-100/90 px-1 py-0.5 text-xs">
                    supabase/migrations/006_conquistas.sql
                  </code>
                  .
                </li>
                <li>
                  Depois execute:{" "}
                  <code className="rounded bg-amber-100/90 px-1 py-0.5 text-xs">
                    NOTIFY pgrst, &apos;reload schema&apos;;
                  </code>
                </li>
                <li>Use o botão abaixo para testar de novo.</li>
              </ol>
              <button
                type="button"
                disabled={rechecking}
                onClick={() => load("recheck")}
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 shadow-sm hover:bg-amber-100/50 disabled:opacity-60"
              >
                {rechecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {rechecking ? "Verificando…" : "Verificar de novo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-amopark-gray-light pt-6">
        <h3 className="text-sm font-medium text-amopark-charcoal">Nova conquista</h3>
        <div>
          <label className="block text-sm font-medium text-amopark-charcoal">
            Título <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Pavimentação da Rua das Flores"
            className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amopark-charcoal">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Resumo do que foi conquistado ou entregue."
            className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Data ou período (opcional)
            </label>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Ex.: Março 2025"
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-amopark-charcoal/60">
              Texto livre exibido no card.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Cor do destaque
            </label>
            <select
              value={colorIndex}
              onChange={(e) => setColorIndex(parseInt(e.target.value, 10))}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            >
              {COLOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-amopark-green">{msg}</p>}
        <button
          type="submit"
          disabled={saving || tableSetupPending}
          className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Salvando..." : "Publicar conquista"}
        </button>
      </form>

      <div className="border-t border-amopark-gray-light pt-6">
        <h3 className="text-sm font-medium text-amopark-charcoal">
          Cadastradas ({items.length})
        </h3>
        <ul className="mt-3 divide-y divide-amopark-gray-light rounded-lg border border-amopark-gray-light">
          {items.length === 0 ? (
            <li className="p-4 text-center text-sm text-amopark-charcoal/60">
              Nenhuma conquista ainda. Cadastre a primeira acima.
            </li>
          ) : (
            items.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amopark-charcoal">{c.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-amopark-charcoal/70">
                    {c.description}
                  </p>
                  <p className="mt-1 text-xs text-amopark-charcoal/50">
                    {c.dateLabel ?? "—"} ·{" "}
                    {COLOR_OPTIONS[c.colorIndex]?.label ?? `cor ${c.colorIndex}`} ·{" "}
                    {new Date(c.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditErr(null);
                      setEditing(c);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-amopark-gray-light bg-white px-2 py-1 text-xs font-medium text-amopark-charcoal hover:bg-amopark-gray-light"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.title)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-conquista-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            disabled={savingEdit}
            onClick={() => {
              setEditErr(null);
              setEditing(null);
            }}
          />
          <div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-amopark-gray-light bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h3
                id="edit-conquista-title"
                className="text-lg font-semibold text-amopark-charcoal"
              >
                Editar conquista
              </h3>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  setEditErr(null);
                  setEditing(null);
                }}
                className="rounded-md p-1 text-amopark-charcoal/70 hover:bg-amopark-gray-light"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              key={editing.id}
              className="mt-4 space-y-4"
              onSubmit={handleSaveEdit}
            >
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Título
                </label>
                <input
                  name="ec_title"
                  required
                  defaultValue={editing.title}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Descrição
                </label>
                <textarea
                  name="ec_desc"
                  rows={4}
                  defaultValue={editing.description}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Data ou período
                </label>
                <input
                  name="ec_date"
                  type="text"
                  defaultValue={editing.dateLabel ?? ""}
                  placeholder="Ex.: Março 2025"
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Cor do destaque
                </label>
                <select
                  name="ec_color"
                  defaultValue={String(editing.colorIndex)}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                >
                  {COLOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {editErr && (
                <p className="text-sm text-red-600">{editErr}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-60"
                >
                  {savingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {savingEdit ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => {
                    setEditErr(null);
                    setEditing(null);
                  }}
                  className="rounded-lg border border-amopark-gray-light px-4 py-2 text-sm font-medium text-amopark-charcoal hover:bg-amopark-gray-light"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
