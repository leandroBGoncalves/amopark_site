export type EventoMediaKind = "image" | "video_embed";

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
  /** URL da foto de capa, se definida no painel admin. */
  coverImageUrl: string | null;
}

export interface EventoDetailRecord extends EventoListItem {
  body: string;
  midias: EventoMidiaRecord[];
}
