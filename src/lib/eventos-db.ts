import type {
  EventoDetailRecord,
  EventoListItem,
  EventoMidiaRecord,
} from "./eventos-types";
import {
  createPublicReadClient,
  createServiceRoleClient,
} from "./supabase/service";
import { formatPostgrestError } from "./supabase/postgrest-error";
import { normalizeEventDate } from "./evento-calendar";
import { eventoPublicImageUrl } from "./eventos-media";
import { youtubeUrlToEmbed } from "./evento-youtube";

const BUCKET = "eventos";

const EVENTO_LIST_SELECT = `
  id, slug, title, summary, event_date, time_note, edition_label, featured_home, published,
  cover_media_id,
  cover:evento_midias!cover_media_id ( storage_path, kind )
`;

const EVENTO_LIST_SELECT_LEGACY = `
  id, slug, title, summary, event_date, time_note, edition_label, featured_home, published
`;

export interface EventoRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  event_date: string;
  time_note: string | null;
  edition_label: string | null;
  featured_home: boolean;
  published: boolean;
  cover_media_id: string | null;
  created_at: string;
  updated_at: string;
}

type CoverEmbed = { storage_path: string | null; kind: string } | null;

type EventoListRow = EventoRow & { cover?: CoverEmbed };

export interface EventoMidiaRow {
  id: string;
  evento_id: string;
  sort_order: number;
  kind: "image" | "video_embed";
  storage_path: string | null;
  embed_url: string | null;
  caption: string | null;
}

function coverUrlFromEmbed(cover: CoverEmbed | undefined): string | null {
  if (cover?.kind === "image" && cover.storage_path) {
    return eventoPublicImageUrl(cover.storage_path);
  }
  return null;
}

function midiaRowToRecord(
  row: EventoMidiaRow,
  coverMediaId?: string | null
): EventoMidiaRecord {
  const url =
    row.kind === "image" && row.storage_path
      ? eventoPublicImageUrl(row.storage_path)
      : row.embed_url?.trim() ?? "";
  return {
    id: row.id,
    kind: row.kind,
    url,
    caption: row.caption,
    sortOrder: row.sort_order,
    isCover: coverMediaId != null && row.id === coverMediaId,
  };
}

function rowToListItem(row: EventoListRow): EventoListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    eventDate: normalizeEventDate(String(row.event_date ?? "")),
    timeNote: row.time_note,
    editionLabel: row.edition_label,
    featuredHome: row.featured_home,
    coverImageUrl: coverUrlFromEmbed(row.cover),
  };
}

function isCoverColumnUnavailable(error: {
  code?: string;
  message?: string;
}): boolean {
  const m = (error.message ?? "").toLowerCase();
  return m.includes("cover_media_id") || m.includes("cover_media");
}

function isEventosTableUnavailable(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    (m.includes("could not find the table") && m.includes("eventos")) ||
    (m.includes("schema cache") && m.includes("eventos"))
  );
}

export function slugifyTitle(title: string): string {
  const s = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "evento";
}

export async function ensureUniqueEventoSlug(baseSlug: string): Promise<string> {
  const supabase = createServiceRoleClient();
  let slug = baseSlug;
  let n = 0;
  for (;;) {
    const { data } = await supabase
      .from("eventos")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

async function fetchPublishedEventosList(
  build: (
    supabase: ReturnType<typeof createPublicReadClient>,
    select: string
  ) => PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>
): Promise<EventoListItem[]> {
  const supabase = createPublicReadClient();
  let { data, error } = await build(supabase, EVENTO_LIST_SELECT);

  if (error && isCoverColumnUnavailable(error)) {
    ({ data, error } = await build(supabase, EVENTO_LIST_SELECT_LEGACY));
  }

  if (error) {
    if (isEventosTableUnavailable(error)) {
      console.warn("listPublishedEventos: tabela eventos indisponível.");
      return [];
    }
    throw new Error(formatPostgrestError(error));
  }
  return ((data ?? []) as EventoListRow[]).map(rowToListItem);
}

export async function listPublishedEventos(): Promise<EventoListItem[]> {
  return fetchPublishedEventosList((supabase, select) =>
    supabase
      .from("eventos")
      .select(select)
      .eq("published", true)
      .order("event_date", { ascending: false })
  );
}

/** Próximos eventos (data >= hoje) para listagem e home. */
export async function listUpcomingPublishedEventos(): Promise<EventoListItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    return await fetchPublishedEventosList((supabase, select) =>
      supabase
        .from("eventos")
        .select(select)
        .eq("published", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
    );
  } catch {
    return [];
  }
}

/** Destaque na home: marcados + próximos (sem duplicar). */
export async function listHomeEventoHighlights(limit: number): Promise<EventoListItem[]> {
  const featured = await listFeaturedPublishedEventos();
  const upcoming = await listUpcomingPublishedEventos();
  const seen = new Set<string>();
  const out: EventoListItem[] = [];
  for (const e of featured) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      out.push(e);
    }
  }
  for (const e of upcoming) {
    if (out.length >= limit) break;
    if (!seen.has(e.id)) {
      seen.add(e.id);
      out.push(e);
    }
  }
  return out.slice(0, limit);
}

async function listFeaturedPublishedEventos(): Promise<EventoListItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    return await fetchPublishedEventosList((supabase, select) =>
      supabase
        .from("eventos")
        .select(select)
        .eq("published", true)
        .eq("featured_home", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
    );
  } catch {
    return [];
  }
}

export async function getPublishedEventoBySlug(
  slug: string
): Promise<EventoDetailRecord | null> {
  const supabase = createPublicReadClient();
  const { data: ev, error: e1 } = await supabase
    .from("eventos")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (e1) {
    if (isEventosTableUnavailable(e1)) return null;
    throw new Error(formatPostgrestError(e1));
  }
  if (!ev) return null;

  const row = ev as EventoRow;
  const { data: midias, error: e2 } = await supabase
    .from("evento_midias")
    .select("*")
    .eq("evento_id", row.id)
    .order("sort_order", { ascending: true });

  if (e2) {
    if (isEventosTableUnavailable(e2)) {
      return {
        ...rowToListItem(row),
        body: row.body,
        midias: [],
      };
    }
    throw new Error(formatPostgrestError(e2));
  }

  const coverId = row.cover_media_id ?? null;
  const mrec = ((midias ?? []) as EventoMidiaRow[]).map((m) =>
    midiaRowToRecord(m, coverId)
  );
  const coverImageUrl =
    mrec.find((m) => m.isCover && m.kind === "image")?.url ?? null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    eventDate: normalizeEventDate(String(row.event_date ?? "")),
    timeNote: row.time_note,
    editionLabel: row.edition_label,
    featuredHome: row.featured_home,
    coverImageUrl,
    body: row.body,
    midias: mrec,
  };
}

/** Admin: todos os eventos. */
export async function listAllEventosAdmin(): Promise<EventoRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) throw new Error(formatPostgrestError(error));
  return (data ?? []) as EventoRow[];
}

export async function getEventoAdminById(id: string): Promise<EventoRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(formatPostgrestError(error));
  return data ? (data as EventoRow) : null;
}

export async function getEventoMidiasAdmin(eventoId: string): Promise<EventoMidiaRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("evento_midias")
    .select("*")
    .eq("evento_id", eventoId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(formatPostgrestError(error));
  return (data ?? []) as EventoMidiaRow[];
}

export async function insertEventoAdmin(params: {
  slug: string;
  title: string;
  summary: string;
  body: string;
  eventDate: string;
  timeNote: string | null;
  editionLabel: string | null;
  featuredHome: boolean;
  published: boolean;
  userId: string;
}): Promise<EventoRow> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("eventos")
    .insert({
      slug: params.slug,
      title: params.title.trim(),
      summary: params.summary.trim(),
      body: params.body.trim(),
      event_date: params.eventDate,
      time_note: params.timeNote?.trim() || null,
      edition_label: params.editionLabel?.trim() || null,
      featured_home: params.featuredHome,
      published: params.published,
      created_by: params.userId,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatPostgrestError(error));
  return data as EventoRow;
}

export type EventoUpdatePayload = Partial<{
  slug: string;
  title: string;
  summary: string;
  body: string;
  event_date: string;
  time_note: string | null;
  edition_label: string | null;
  featured_home: boolean;
  published: boolean;
  cover_media_id: string | null;
}>;

/** Define ou remove a foto de capa (somente imagens da galeria do evento). */
export async function setEventoCoverAdmin(
  eventoId: string,
  mediaId: string | null
): Promise<EventoRow | null> {
  if (mediaId === null) {
    return updateEventoAdmin(eventoId, { cover_media_id: null });
  }
  const supabase = createServiceRoleClient();
  const { data: midia, error } = await supabase
    .from("evento_midias")
    .select("id, evento_id, kind")
    .eq("id", mediaId)
    .maybeSingle();
  if (error) throw new Error(formatPostgrestError(error));
  if (!midia) throw new Error("Mídia não encontrada.");
  const m = midia as { id: string; evento_id: string; kind: string };
  if (m.evento_id !== eventoId) {
    throw new Error("Esta mídia não pertence ao evento.");
  }
  if (m.kind !== "image") {
    throw new Error("Só fotos podem ser usadas como capa.");
  }
  return updateEventoAdmin(eventoId, { cover_media_id: mediaId });
}

export async function updateEventoAdmin(
  id: string,
  patch: EventoUpdatePayload
): Promise<EventoRow | null> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = { updated_at: now };

  if (patch.slug !== undefined) row.slug = patch.slug.trim();
  if (patch.title !== undefined) row.title = patch.title.trim();
  if (patch.summary !== undefined) row.summary = patch.summary.trim();
  if (patch.body !== undefined) row.body = patch.body.trim();
  if (patch.event_date !== undefined) row.event_date = patch.event_date;
  if (patch.time_note !== undefined) {
    row.time_note =
      patch.time_note === null || patch.time_note === ""
        ? null
        : patch.time_note.trim();
  }
  if (patch.edition_label !== undefined) {
    row.edition_label =
      patch.edition_label === null || patch.edition_label === ""
        ? null
        : patch.edition_label.trim();
  }
  if (patch.featured_home !== undefined) row.featured_home = patch.featured_home;
  if (patch.published !== undefined) row.published = patch.published;
  if (patch.cover_media_id !== undefined) row.cover_media_id = patch.cover_media_id;

  if (Object.keys(row).length === 1) {
    return getEventoAdminById(id);
  }

  const { data, error } = await supabase
    .from("eventos")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(formatPostgrestError(error));
  return data ? (data as EventoRow) : null;
}

export async function deleteEventoAdmin(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from("eventos")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!row) return false;

  const { data: midias } = await supabase
    .from("evento_midias")
    .select("storage_path")
    .eq("evento_id", id);

  const paths = ((midias ?? []) as { storage_path: string | null }[])
    .map((m) => m.storage_path)
    .filter((p): p is string => Boolean(p));

  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) throw new Error(formatPostgrestError(error));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
  return true;
}

export async function nextMidiaSortOrder(eventoId: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("evento_midias")
    .select("sort_order")
    .eq("evento_id", eventoId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const max = data ? (data as { sort_order: number }).sort_order : -1;
  return max + 1;
}

export async function insertEventoMidiaImage(params: {
  eventoId: string;
  storagePath: string;
  caption: string | null;
}): Promise<EventoMidiaRow> {
  const supabase = createServiceRoleClient();
  const sortOrder = await nextMidiaSortOrder(params.eventoId);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("evento_midias")
    .insert({
      evento_id: params.eventoId,
      sort_order: sortOrder,
      kind: "image",
      storage_path: params.storagePath,
      embed_url: null,
      caption: params.caption?.trim() || null,
      created_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatPostgrestError(error));
  return data as EventoMidiaRow;
}

export async function insertEventoMidiaVideo(params: {
  eventoId: string;
  embedUrl: string;
  caption: string | null;
}): Promise<EventoMidiaRow> {
  const embed = youtubeUrlToEmbed(params.embedUrl);
  if (!embed) {
    throw new Error(
      "URL de vídeo inválida. Use um link do YouTube (youtube.com ou youtu.be)."
    );
  }
  const supabase = createServiceRoleClient();
  const sortOrder = await nextMidiaSortOrder(params.eventoId);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("evento_midias")
    .insert({
      evento_id: params.eventoId,
      sort_order: sortOrder,
      kind: "video_embed",
      storage_path: null,
      embed_url: embed,
      caption: params.caption?.trim() || null,
      created_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatPostgrestError(error));
  return data as EventoMidiaRow;
}

export async function deleteEventoMidiaAdmin(
  mediaId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from("evento_midias")
    .select("*")
    .eq("id", mediaId)
    .maybeSingle();
  if (!row) return false;

  const r = row as EventoMidiaRow;
  const { error } = await supabase.from("evento_midias").delete().eq("id", mediaId);
  if (error) throw new Error(formatPostgrestError(error));

  if (r.kind === "image" && r.storage_path) {
    await supabase.storage.from(BUCKET).remove([r.storage_path]);
  }
  return true;
}

export { BUCKET as EVENTOS_BUCKET };
