import type { ParceiroRecord } from "./parceiros-types";

export type EventoMediaKind = "image" | "video_embed";

export type EventoParceiroRole = "patrocinador" | "apoiador";

export interface EventoParceirosGrouped {
  patrocinadores: ParceiroRecord[];
  apoiadores: ParceiroRecord[];
}

export interface EventoMidiaRecord {
  id: string;
  kind: EventoMediaKind;
  /** URL pública da imagem ou URL de embed do vídeo */
  url: string;
  caption: string | null;
  sortOrder: number;
  isCover?: boolean;
}

export interface EventoListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  timeNote: string | null;
  editionLabel: string | null;
  featuredHome: boolean;
  festaJulinaLanding: boolean;
  featuredCarousel: boolean;
  /** URL da foto de capa, se definida no painel admin. */
  coverImageUrl: string | null;
}

export interface EventoDetailRecord extends EventoListItem {
  body: string;
  midias: EventoMidiaRecord[];
  parceiros: EventoParceirosGrouped;
}

export const EMPTY_EVENTO_PARCEIROS: EventoParceirosGrouped = {
  patrocinadores: [],
  apoiadores: [],
};
