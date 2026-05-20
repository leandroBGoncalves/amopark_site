"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Handshake,
  ImagePlus,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { ParceiroRow } from "@/lib/parceiros-db";
import { parceiroPublicLogoUrl } from "@/lib/parceiros-media";
import {
  PARCEIRO_TYPE_LABELS,
  PARCEIRO_TYPES,
  type ParceiroType,
} from "@/lib/parceiros-types";
import { cn } from "@/lib/utils";

export function AdminParceirosSection({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<ParceiroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [partnerType, setPartnerType] = useState<ParceiroType>("empresa");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [featuredHome, setFeaturedHome] = useState(false);
  const [published, setPublished] = useState(true);
  const [editing, setEditing] = useState<ParceiroRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/admin/parceiros?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao listar parceiros."
        );
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar parceiros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!name.trim()) {
      setErr("Nome do parceiro é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/parceiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          partner_type: partnerType,
          summary: summary.trim(),
          description: description.trim(),
          website_url: websiteUrl.trim() || null,
          sort_order: sortOrder,
          featured_home: featuredHome,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao criar.");
        return;
      }
      setMsg("Parceiro criado. Abra Editar para enviar logo/foto.");
      setName("");
      setSlug("");
      setSummary("");
      setDescription("");
      setWebsiteUrl("");
      setSortOrder(0);
      setFeaturedHome(false);
      setPublished(true);
      await load();
      setEditing(data as ParceiroRow);
    } catch {
      setErr("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setEditErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/admin/parceiros/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("ep_name") ?? ""),
          slug: String(fd.get("ep_slug") ?? ""),
          partner_type: String(fd.get("ep_type") ?? "cidadao"),
          summary: String(fd.get("ep_summary") ?? ""),
          description: String(fd.get("ep_description") ?? ""),
          website_url: String(fd.get("ep_website") ?? "").trim() || null,
          sort_order: parseInt(String(fd.get("ep_sort") ?? "0"), 10) || 0,
          featured_home: fd.get("ep_featured") === "on",
          published: fd.get("ep_pub") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(data.error ?? "Erro ao salvar.");
        return;
      }
      setEditing(data as ParceiroRow);
      setMsg("Parceiro atualizado.");
      await load();
    } catch {
      setEditErr("Erro de rede.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Remover o parceiro "${label}"?`)) return;
    try {
      const res = await fetch(`/api/admin/parceiros/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao remover.");
        return;
      }
      if (editing?.id === id) setEditing(null);
      setMsg("Parceiro removido.");
      await load();
    } catch {
      setErr("Erro ao remover.");
    }
  }

  async function handleLogoUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="logo"]');
    const file = input?.files?.[0];
    if (!file) {
      setEditErr("Selecione uma imagem.");
      return;
    }
    setUploadingLogo(true);
    setEditErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/parceiros/${editing.id}/logo`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(data.error ?? "Erro no upload.");
        return;
      }
      setEditing(data as ParceiroRow);
      setMsg("Logo atualizado.");
      await load();
      if (input) input.value = "";
    } catch {
      setEditErr("Erro no upload.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function removeLogo() {
    if (!editing) return;
    setUploadingLogo(true);
    setEditErr(null);
    try {
      const res = await fetch(`/api/admin/parceiros/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove_logo: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(data.error ?? "Erro ao remover logo.");
        return;
      }
      setEditing(data as ParceiroRow);
      setMsg("Logo removido.");
      await load();
    } catch {
      setEditErr("Erro de rede.");
    } finally {
      setUploadingLogo(false);
    }
  }

  const shell = embedded
    ? "space-y-6"
    : "space-y-6 rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm";

  if (loading) {
    return (
      <section className={embedded ? "py-6" : shell}>
        <div className="flex items-center gap-2 text-amopark-charcoal/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando parceiros...
        </div>
      </section>
    );
  }

  return (
    <section className={shell}>
      <h2 className="flex items-center gap-2 font-semibold text-amopark-charcoal">
        <Handshake className="h-5 w-5 text-amopark-green" />
        Parceiros da comunidade
      </h2>
      <p className="text-sm text-amopark-charcoal/70">
        Cadastre apoiadores por categoria: empresa, entidade, político ou cidadão.
        Opcional: logo, site e destaque na home.
      </p>

      <form
        onSubmit={handleCreate}
        className="space-y-4 border-t border-amopark-gray-light pt-6"
      >
        <h3 className="text-sm font-medium text-amopark-charcoal">Novo parceiro</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              Nome <span className="text-red-600">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              placeholder="Ex.: Empresa XYZ ou Vereador(a) ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value as ParceiroType)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            >
              {PARCEIRO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PARCEIRO_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Ordem na lista</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
            <p className="mt-0.5 text-xs text-amopark-charcoal/55">Menor = aparece antes</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (opcional)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Site (opcional)</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Resumo (lista pública)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Texto complementar (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredHome}
              onChange={(e) => setFeaturedHome(e.target.checked)}
            />
            Destaque na home
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publicado no site
          </label>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-amopark-green">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Criar parceiro"}
        </button>
      </form>

      <div className="border-t border-amopark-gray-light pt-6">
        <h3 className="text-sm font-medium">Cadastrados ({rows.length})</h3>
        <ul className="mt-3 divide-y divide-amopark-gray-light rounded-lg border border-amopark-gray-light">
          {rows.length === 0 ? (
            <li className="p-4 text-center text-sm text-amopark-charcoal/60">
              Nenhum parceiro ainda.
            </li>
          ) : (
            rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amopark-charcoal">{r.name}</p>
                  <p className="mt-1 text-xs text-amopark-charcoal/60">
                    {PARCEIRO_TYPE_LABELS[r.partner_type]}
                    {r.published ? " · publicado" : " · rascunho"}
                    {r.featured_home ? " · destaque home" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditErr(null);
                      setEditing(r);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-amopark-gray-light px-2 py-1 text-xs font-medium"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.name)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-700"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            onClick={() => setEditing(null)}
          />
          <div
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-amopark-gray-light bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">Editar parceiro</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md p-1 hover:bg-amopark-gray-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form key={editing.id} className="mt-4 space-y-3" onSubmit={handleSaveEdit}>
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input
                  name="ep_name"
                  required
                  defaultValue={editing.name}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select
                    name="ep_type"
                    defaultValue={editing.partner_type}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  >
                    {PARCEIRO_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {PARCEIRO_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Ordem</label>
                  <input
                    name="ep_sort"
                    type="number"
                    defaultValue={editing.sort_order}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input
                  name="ep_slug"
                  defaultValue={editing.slug}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Site</label>
                <input
                  name="ep_website"
                  defaultValue={editing.website_url ?? ""}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Resumo</label>
                <textarea
                  name="ep_summary"
                  rows={2}
                  defaultValue={editing.summary}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Texto complementar</label>
                <textarea
                  name="ep_description"
                  rows={3}
                  defaultValue={editing.description}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="ep_featured"
                  defaultChecked={editing.featured_home}
                />
                Destaque na home
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="ep_pub" defaultChecked={editing.published} />
                Publicado
              </label>
              {editErr && <p className="text-sm text-red-600">{editErr}</p>}
              <button
                type="submit"
                disabled={savingEdit}
                className="rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {savingEdit ? "Salvando…" : "Salvar dados"}
              </button>
            </form>

            <div className="mt-8 border-t border-amopark-gray-light pt-6">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <ImagePlus className="h-4 w-4" />
                Logo ou foto
              </h4>
              {editing.logo_storage_path && (
                <div className="mt-3 flex items-start gap-3">
                  <img
                    src={parceiroPublicLogoUrl(editing.logo_storage_path)}
                    alt=""
                    className="h-20 w-20 rounded-lg border object-contain p-1"
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={removeLogo}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remover logo
                  </button>
                </div>
              )}
              <form onSubmit={handleLogoUpload} className="mt-3 space-y-2">
                <input
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="rounded-lg border border-amopark-gray-light px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  {uploadingLogo ? "Enviando…" : "Enviar logo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
