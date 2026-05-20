"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ImagePlus,
  Loader2,
  Pencil,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import type { EventoRow } from "@/lib/eventos-db";
import { eventoPublicImageUrl } from "@/lib/eventos-media";
import { cn } from "@/lib/utils";

type MidiaRow = {
  id: string;
  kind: string;
  storage_path: string | null;
  embed_url: string | null;
  caption: string | null;
  sort_order: number;
};

export function AdminEventosSection({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<EventoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [timeNote, setTimeNote] = useState("");
  const [editionLabel, setEditionLabel] = useState("");
  const [featuredHome, setFeaturedHome] = useState(false);
  const [published, setPublished] = useState(true);
  const [editing, setEditing] = useState<EventoRow | null>(null);
  const [midias, setMidias] = useState<MidiaRow[]>([]);
  const [loadingMidias, setLoadingMidias] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/admin/eventos?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Falha ao listar eventos."
        );
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMidias = useCallback(async (eventoId: string) => {
    setLoadingMidias(true);
    try {
      const res = await fetch(`/api/admin/eventos/${eventoId}/midias`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setMidias([]);
        return;
      }
      setMidias(Array.isArray(data) ? data : []);
    } finally {
      setLoadingMidias(false);
    }
  }, []);

  useEffect(() => {
    if (editing) {
      setVideoUrl("");
      setMediaCaption("");
      loadMidias(editing.id);
    } else {
      setMidias([]);
    }
  }, [editing, loadMidias]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!title.trim() || !eventDate) {
      setErr("Título e data do evento são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          summary: summary.trim(),
          body: body.trim(),
          event_date: eventDate,
          time_note: timeNote.trim() || null,
          edition_label: editionLabel.trim() || null,
          featured_home: featuredHome,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao criar.");
        return;
      }
      const created = data as EventoRow;
      setTitle("");
      setSlug("");
      setSummary("");
      setBody("");
      setEventDate("");
      setTimeNote("");
      setEditionLabel("");
      setFeaturedHome(false);
      setPublished(true);
      await load();
      setEditErr(null);
      setEditing(created);
      setMsg(
        "Evento criado. Use a seção Galeria abaixo para fotos e vídeos do YouTube."
      );
    } catch {
      setErr("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget;
    const t = (form.elements.namedItem("ee_title") as HTMLInputElement).value.trim();
    if (!t) {
      setEditErr("Título é obrigatório.");
      return;
    }
    const s = (form.elements.namedItem("ee_summary") as HTMLTextAreaElement).value;
    const b = (form.elements.namedItem("ee_body") as HTMLTextAreaElement).value;
    const d = (form.elements.namedItem("ee_date") as HTMLInputElement).value;
    if (!d) {
      setEditErr("Data obrigatória.");
      return;
    }
    const sl = (form.elements.namedItem("ee_slug") as HTMLInputElement).value.trim();
    const tn = (form.elements.namedItem("ee_time") as HTMLInputElement).value.trim();
    const ed = (form.elements.namedItem("ee_edition") as HTMLInputElement).value.trim();
    const fh = (form.elements.namedItem("ee_featured") as HTMLInputElement).checked;
    const pub = (form.elements.namedItem("ee_pub") as HTMLInputElement).checked;

    setSavingEdit(true);
    setEditErr(null);
    try {
      const res = await fetch(`/api/admin/eventos/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          slug: sl || undefined,
          summary: s,
          body: b,
          event_date: d,
          time_note: tn || null,
          edition_label: ed || null,
          featured_home: fh,
          published: pub,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(data.error ?? "Erro ao salvar.");
        return;
      }
      setMsg("Evento atualizado.");
      setEditing(null);
      await load();
    } catch {
      setEditErr("Erro ao salvar.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o evento "${name}" e todas as mídias?`)) return;
    setErr(null);
    try {
      const res = await fetch(`/api/admin/eventos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao remover.");
        return;
      }
      setMsg("Evento removido.");
      await load();
    } catch {
      setErr("Erro ao remover.");
    }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !videoUrl.trim()) return;
    setErr(null);
    try {
      const res = await fetch(`/api/admin/eventos/${editing.id}/midias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embed_url: videoUrl.trim(),
          caption: mediaCaption.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro ao adicionar vídeo.");
        return;
      }
      setVideoUrl("");
      setMediaCaption("");
      await loadMidias(editing.id);
      setMsg("Vídeo adicionado.");
    } catch {
      setErr("Erro de rede.");
    }
  }

  async function handleAddImage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="img"]');
    const file = input?.files?.[0];
    if (!file) {
      setErr("Selecione uma imagem.");
      return;
    }
    setUploadingImg(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (mediaCaption.trim()) fd.append("caption", mediaCaption.trim());
      const res = await fetch(`/api/admin/eventos/${editing.id}/midias`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Erro no upload.");
        return;
      }
      input.value = "";
      setMediaCaption("");
      await loadMidias(editing.id);
      setMsg("Foto adicionada.");
    } catch {
      setErr("Erro no upload.");
    } finally {
      setUploadingImg(false);
    }
  }

  async function removeMidia(mediaId: string) {
    if (!editing || !confirm("Remover esta mídia?")) return;
    try {
      const res = await fetch(
        `/api/admin/eventos/${editing.id}/midias/${mediaId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        setErr(data.error ?? "Erro ao remover.");
        return;
      }
      if (editing.cover_media_id === mediaId) {
        setEditing({ ...editing, cover_media_id: null });
      }
      await loadMidias(editing.id);
      setMsg("Mídia removida.");
    } catch {
      setErr("Erro ao remover mídia.");
    }
  }

  async function setCover(mediaId: string | null) {
    if (!editing) return;
    setSettingCoverId(mediaId);
    setEditErr(null);
    try {
      const res = await fetch(`/api/admin/eventos/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_media_id: mediaId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErr(
          typeof data?.error === "string" ? data.error : "Erro ao definir capa."
        );
        return;
      }
      setEditing(data as EventoRow);
      setMsg(mediaId ? "Capa atualizada." : "Capa removida.");
    } catch {
      setEditErr("Erro de rede ao definir capa.");
    } finally {
      setSettingCoverId(null);
    }
  }

  const shell =
    embedded ? "space-y-6" : "space-y-6 rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm";

  if (loading) {
    return (
      <section className={embedded ? "py-6" : shell}>
        <div className="flex items-center gap-2 text-amopark-charcoal/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando eventos...
        </div>
      </section>
    );
  }

  return (
    <section className={shell}>
      <h2 className="flex items-center gap-2 font-semibold text-amopark-charcoal">
        <CalendarDays className="h-5 w-5 text-amopark-orange" />
        Eventos (calendário e galeria)
      </h2>
      <p className="text-sm text-amopark-charcoal/70">
        Cadastre datas e textos aqui. <strong>Fotos e vídeos</strong> ficam na janela{" "}
        <strong>Editar / mídias</strong> (ao criar um evento novo, essa janela abre
        automaticamente para você enviar imagens e links do YouTube).
      </p>

      <form
        onSubmit={handleCreate}
        className="space-y-4 border-t border-amopark-gray-light pt-6"
      >
        <h3 className="text-sm font-medium text-amopark-charcoal">Novo evento</h3>
        <p className="rounded-lg border border-amopark-blue/20 bg-amopark-blue/5 px-3 py-2 text-xs text-amopark-charcoal/85">
          Este formulário só cria o evento (título, data, textos). Depois de clicar em{" "}
          <strong>Criar evento</strong>, abrimos a edição com a seção{" "}
          <strong>Galeria</strong> (fotos + YouTube). Para eventos antigos, clique em{" "}
          <strong>Editar / mídias</strong> na lista.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-amopark-charcoal">
              Título <span className="text-red-600">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              placeholder="Ex.: Arraia do North Park"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Slug na URL (opcional)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              placeholder="Gerado do título se vazio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Data do evento <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Edição (opcional)
            </label>
            <input
              value={editionLabel}
              onChange={(e) => setEditionLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              placeholder="Ex.: 5ª edição — 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amopark-charcoal">
              Horário / observação
            </label>
            <input
              value={timeNote}
              onChange={(e) => setTimeNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
              placeholder="Ex.: 19h às 23h"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-amopark-charcoal">
              Resumo (lista e cards)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-amopark-charcoal">
              Texto completo (página do evento)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredHome}
              onChange={(e) => setFeaturedHome(e.target.checked)}
            />
            Destaque na home (próximos eventos)
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
          {saving ? "Salvando…" : "Criar evento"}
        </button>
      </form>

      <div className="border-t border-amopark-gray-light pt-6">
        <h3 className="text-sm font-medium text-amopark-charcoal">
          Cadastrados ({rows.length})
        </h3>
        <ul className="mt-3 divide-y divide-amopark-gray-light rounded-lg border border-amopark-gray-light">
          {rows.length === 0 ? (
            <li className="p-4 text-center text-sm text-amopark-charcoal/60">
              Nenhum evento. Crie o primeiro acima.
            </li>
          ) : (
            rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amopark-charcoal">{r.title}</p>
                  <p className="mt-1 text-xs text-amopark-charcoal/60">
                    {r.event_date}
                    {r.published ? " · publicado" : " · rascunho"}
                    {r.featured_home ? " · destaque home" : ""}
                  </p>
                  <p className="mt-1 text-xs text-amopark-charcoal/50">
                    /eventos/{r.slug}
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
                    Editar / mídias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.title)}
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            disabled={savingEdit}
            onClick={() => setEditing(null)}
          />
          <div
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-amopark-gray-light bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">Editar evento</h3>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditing(null)}
                className="rounded-md p-1 hover:bg-amopark-gray-light"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              key={editing.id}
              className="mt-4 space-y-3"
              onSubmit={handleSaveEdit}
            >
              <div>
                <label className="text-sm font-medium">Título</label>
                <input
                  name="ee_title"
                  required
                  defaultValue={editing.title}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input
                  name="ee_slug"
                  defaultValue={editing.slug}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data</label>
                <input
                  type="date"
                  name="ee_date"
                  required
                  defaultValue={editing.event_date}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Edição</label>
                  <input
                    name="ee_edition"
                    defaultValue={editing.edition_label ?? ""}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horário / nota</label>
                  <input
                    name="ee_time"
                    defaultValue={editing.time_note ?? ""}
                    className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Resumo</label>
                <textarea
                  name="ee_summary"
                  rows={2}
                  defaultValue={editing.summary}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Texto completo</label>
                <textarea
                  name="ee_body"
                  rows={5}
                  defaultValue={editing.body}
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="ee_featured"
                  defaultChecked={editing.featured_home}
                />
                Destaque na home
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="ee_pub"
                  defaultChecked={editing.published}
                />
                Publicado
              </label>
              {editErr && <p className="text-sm text-red-600">{editErr}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-amopark-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {savingEdit ? "Salvando…" : "Salvar"}
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditing(null)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Fechar
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-amopark-gray-light pt-6">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <ImagePlus className="h-4 w-4" />
                Galeria
              </h4>
              <p className="mt-1 text-xs text-amopark-charcoal/60">
                Em fotos, use <strong>Usar como capa</strong> para exibir na lista e no topo
                da página do evento.
              </p>
              {loadingMidias ? (
                <p className="mt-2 text-sm text-amopark-charcoal/60">Carregando mídias…</p>
              ) : midias.length === 0 ? (
                <p className="mt-2 text-sm text-amopark-charcoal/60">
                  Nenhuma mídia ainda. Envie uma foto abaixo.
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {midias.map((m) => {
                    const isCover = editing.cover_media_id === m.id;
                    const thumbUrl =
                      m.kind === "image" && m.storage_path
                        ? eventoPublicImageUrl(m.storage_path)
                        : null;
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          "overflow-hidden rounded-lg border text-xs",
                          isCover
                            ? "border-amopark-orange ring-2 ring-amopark-orange/30"
                            : "border-amopark-gray-light"
                        )}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={m.caption || "Foto"}
                            className="h-28 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-28 items-center justify-center bg-amopark-gray-light/40 text-amopark-charcoal/60">
                            <Video className="h-8 w-8" />
                          </div>
                        )}
                        <div className="space-y-2 p-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-medium text-amopark-charcoal">
                              {m.kind === "image" ? "Foto" : "Vídeo"}
                            </span>
                            {isCover && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amopark-orange/15 px-2 py-0.5 text-[10px] font-semibold text-amopark-orange">
                                <Star className="h-3 w-3 fill-current" />
                                Capa
                              </span>
                            )}
                          </div>
                          {m.caption && (
                            <p className="line-clamp-2 text-amopark-charcoal/70">
                              {m.caption}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {m.kind === "image" && !isCover && (
                              <button
                                type="button"
                                disabled={settingCoverId !== null}
                                onClick={() => setCover(m.id)}
                                className="rounded border border-amopark-orange/40 px-2 py-1 text-[11px] font-medium text-amopark-orange hover:bg-amopark-orange/10 disabled:opacity-50"
                              >
                                {settingCoverId === m.id ? "…" : "Usar como capa"}
                              </button>
                            )}
                            {isCover && (
                              <button
                                type="button"
                                disabled={settingCoverId !== null}
                                onClick={() => setCover(null)}
                                className="rounded border px-2 py-1 text-[11px] hover:bg-amopark-gray-light/60 disabled:opacity-50"
                              >
                                Remover capa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeMidia(m.id)}
                              className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <form onSubmit={handleAddVideo} className="mt-4 space-y-2">
                <p className="flex items-center gap-1 text-xs font-medium text-amopark-charcoal">
                  <Video className="h-3.5 w-3.5" />
                  Vídeo (YouTube)
                </p>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
                <input
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="Legenda (opcional)"
                  className="w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-amopark-gray-light px-3 py-1.5 text-sm"
                >
                  Adicionar vídeo
                </button>
              </form>

              <form onSubmit={handleAddImage} className="mt-4 space-y-2">
                <p className="text-xs font-medium text-amopark-charcoal">Foto (JPEG, PNG, WebP, GIF)</p>
                <input name="img" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
                <p className="text-xs text-amopark-charcoal/60">
                  Use o campo legenda acima para a foto, se quiser.
                </p>
                <button
                  type="submit"
                  disabled={uploadingImg}
                  className="rounded-lg border border-amopark-gray-light px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  {uploadingImg ? "Enviando…" : "Enviar foto"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
