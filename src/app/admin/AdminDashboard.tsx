"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import type { OficioRecord } from "@/lib/oficios-types";
import {
  OFICIO_STATUS_VALUES,
  isOficioStatusValue,
  oficioStatusLabel,
} from "@/lib/oficios-status";
import { createClient } from "@/lib/supabase/client";

export function AdminDashboard() {
  const router = useRouter();
  const [oficios, setOficios] = useState<OficioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [editing, setEditing] = useState<OficioRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");

  async function load() {
    setError(null);
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
            : "Falha ao listar.";
        throw new Error(msg);
      }
      setOficios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar os ofícios."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="file"]');
    const file = input?.files?.[0];
    if (!file) {
      setError("Selecione um arquivo (.docx, .pdf ou imagem).");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (titulo.trim()) fd.append("titulo", titulo.trim());
      const numeroEl = form.querySelector<HTMLInputElement>(
        'input[name="numero_oficio"]'
      );
      const numeroVal = numeroEl?.value?.trim();
      if (numeroVal) fd.append("numero_oficio", numeroVal);
      const destEl = form.querySelector<HTMLInputElement>(
        'input[name="destinatario"]'
      );
      const destVal = destEl?.value?.trim();
      if (destVal) fd.append("destinatario", destVal);
      const dataEl = form.querySelector<HTMLInputElement>(
        'input[name="data_oficio"]'
      );
      const dataVal = dataEl?.value?.trim();
      if (dataVal) fd.append("data_oficio", dataVal);
      const statusEl = form.querySelector<HTMLSelectElement>(
        'select[name="status"]'
      );
      const st = statusEl?.value;
      if (st && isOficioStatusValue(st)) fd.append("status", st);
      const resumoEl = form.querySelector<HTMLTextAreaElement>(
        'textarea[name="resumo"]'
      );
      const resumoVal = resumoEl?.value?.trim();
      if (resumoVal) fd.append("resumo", resumoVal);
      const res = await fetch("/api/admin/oficios/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro no upload.");
        return;
      }
      setMessage("Documento publicado no mural.");
      setTitulo("");
      form.reset();
      await load();
    } catch {
      setError("Erro de rede no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget;
    const name = (
      form.elements.namedItem("edit_name") as HTMLInputElement
    ).value.trim();
    if (!name) {
      setEditError("Título é obrigatório.");
      return;
    }
    const summary = (
      form.elements.namedItem("edit_summary") as HTMLTextAreaElement
    ).value;
    const numero = (
      form.elements.namedItem("edit_numero") as HTMLInputElement
    ).value.trim();
    const dest = (
      form.elements.namedItem("edit_destinatario") as HTMLInputElement
    ).value.trim();
    const dataRaw = (
      form.elements.namedItem("edit_data_oficio") as HTMLInputElement
    ).value.trim();
    const status = (
      form.elements.namedItem("edit_status") as HTMLSelectElement
    ).value;

    if (!isOficioStatusValue(status)) {
      setEditError("Status inválido.");
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/oficios/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          summary,
          status,
          numero_oficio: numero === "" ? null : numero,
          destinatario: dest === "" ? null : dest,
          data_oficio: dataRaw === "" ? null : dataRaw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Erro ao salvar.");
        return;
      }
      setMessage("Alterações salvas.");
      setEditing(null);
      await load();
    } catch {
      setEditError("Erro ao salvar.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleStatusChange(id: string, value: string) {
    if (!isOficioStatusValue(value)) return;
    setSavingStatusId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/oficios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar status.");
        return;
      }
      setMessage("Status atualizado.");
      await load();
    } catch {
      setError("Erro ao atualizar status.");
    } finally {
      setSavingStatusId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}" do mural?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/oficios/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao remover.");
        return;
      }
      setMessage("Ofício removido.");
      await load();
    } catch {
      setError("Erro ao remover.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-amopark-charcoal/70">
        <Loader2 className="h-10 w-10 animate-spin" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amopark-charcoal">
            Ofícios e documentos
          </h1>
          <p className="mt-1 text-sm text-amopark-charcoal/70">
            Envie Word (.docx), PDF ou imagem. Em .docx, o texto do arquivo vira prévia no mural; em PDF/imagem use o resumo opcional.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-amopark-gray-light bg-white px-4 py-2 text-sm font-medium text-amopark-charcoal hover:bg-amopark-gray-light"
        >
          Sair
        </button>
      </div>

      <section className="rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-amopark-charcoal">
          <Upload className="h-5 w-5 text-amopark-blue" />
          Novo documento
        </h2>
        <form onSubmit={handleUpload} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Título no mural (opcional)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Solicitação à Prefeitura — pavimentação"
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-amopark-charcoal">
                Nº do ofício (opcional)
              </label>
              <input
                type="text"
                name="numero_oficio"
                placeholder="Ex.: OF-2025-012"
                className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-amopark-charcoal">
                Destino (opcional)
              </label>
              <input
                type="text"
                name="destinatario"
                placeholder="Ex.: Prefeitura, Secretaria de Obras"
                className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amopark-charcoal">
                Data do ofício (opcional)
              </label>
              <input
                type="date"
                name="data_oficio"
                className="mt-1 w-full max-w-xs rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-amopark-charcoal/60">
                Se vazio, o site usa a data de publicação.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Status
            </label>
            <select
              name="status"
              defaultValue="enviado"
              className="mt-1 w-full max-w-xs rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            >
              {OFICIO_STATUS_VALUES.map((v) => (
                <option key={v} value={v}>
                  {oficioStatusLabel(v)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-amopark-charcoal/60">
              Você pode alterar depois na lista abaixo.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Resumo no mural (opcional)
            </label>
            <textarea
              name="resumo"
              rows={4}
              placeholder="Recomendado para PDF e fotos. Em .docx pode ficar em branco (usa o texto do documento)."
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Arquivo
            </label>
            <input
              name="file"
              type="file"
              accept=".docx,.pdf,.jpg,.jpeg,.png,.gif,.webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/jpeg,image/png,image/gif,image/webp"
              className="mt-1 block w-full text-sm text-amopark-charcoal"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-amopark-green">{message}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Enviando..." : "Publicar no mural"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold text-amopark-charcoal">
          Publicados ({oficios.length})
        </h2>
        <ul className="mt-4 divide-y divide-amopark-gray-light rounded-xl border border-amopark-gray-light bg-white">
          {oficios.length === 0 ? (
            <li className="p-6 text-center text-sm text-amopark-charcoal/60">
              Nenhum documento ainda. Envie o primeiro acima.
            </li>
          ) : (
            oficios.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amopark-charcoal">{o.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-amopark-charcoal/70">
                    {o.summary}
                  </p>
                  <p className="mt-1 text-xs text-amopark-charcoal/50">
                    {new Date(o.createdTime).toLocaleString("pt-BR")}
                    {o.storageFilename ? " · armazenado no site" : " · link externo"}
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-amopark-charcoal/60">Status</span>
                    <select
                      value={o.status}
                      disabled={savingStatusId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="rounded-lg border border-amopark-gray-light px-2 py-1.5 text-sm min-w-[9.5rem]"
                    >
                      {OFICIO_STATUS_VALUES.map((v) => (
                        <option key={v} value={v}>
                          {oficioStatusLabel(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditError(null);
                      setEditing(o);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-amopark-gray-light bg-white px-2 py-1 text-xs font-medium text-amopark-charcoal hover:bg-amopark-gray-light"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(o.id, o.name)}
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
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-oficio-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            disabled={savingEdit}
            onClick={() => {
              setEditError(null);
              setEditing(null);
            }}
          />
          <div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-amopark-gray-light bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h3
                id="edit-oficio-title"
                className="text-lg font-semibold text-amopark-charcoal"
              >
                Editar ofício
              </h3>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  setEditError(null);
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
                  Título no mural
                </label>
                <input
                  name="edit_name"
                  required
                  defaultValue={editing.name}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Resumo no mural
                </label>
                <textarea
                  name="edit_summary"
                  rows={4}
                  defaultValue={editing.summary}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-amopark-charcoal">
                    Nº do ofício
                  </label>
                  <input
                    name="edit_numero"
                    defaultValue={editing.numeroOficio ?? ""}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amopark-charcoal">
                    Destino
                  </label>
                  <input
                    name="edit_destinatario"
                    defaultValue={editing.destinatario ?? ""}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Data do ofício
                </label>
                <input
                  type="date"
                  name="edit_data_oficio"
                  defaultValue={editing.dataOficio ?? ""}
                  className="mt-1 w-full max-w-xs rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-amopark-charcoal/60">
                  Vazio = exibir data de publicação no site.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amopark-charcoal">
                  Status
                </label>
                <select
                  name="edit_status"
                  defaultValue={editing.status}
                  className="mt-1 w-full max-w-xs rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                >
                  {OFICIO_STATUS_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {oficioStatusLabel(v)}
                    </option>
                  ))}
                </select>
              </div>
              {editError && (
                <p className="text-sm text-red-600">{editError}</p>
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
                  {savingEdit ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => {
                    setEditError(null);
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
    </div>
  );
}
