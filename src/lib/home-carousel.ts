import type { ConquistaRecord } from "./conquistas-types";
import { ROUTES } from "./constants";
import type { EventoListItem } from "./eventos-types";
import { normalizeEventDate } from "./evento-calendar";
import type { ParceiroRecord } from "./parceiros-types";
import { parceiroBadgeLabel } from "./parceiros-types";
import { siteConfig } from "./utils";

export type HomeCarouselSlideKind = "conquista" | "evento" | "parceiro" | "welcome";

export interface HomeCarouselSlide {
  id: string;
  kind: HomeCarouselSlideKind;
  badge: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageUrl: string | null;
  /** Painel decorativo quando não há foto */
  panelClass: string;
}

const CONQUISTA_PANEL = [
  "bg-gradient-to-br from-amopark-red/90 to-amopark-red/50",
  "bg-gradient-to-br from-amopark-orange/90 to-amopark-orange/50",
  "bg-gradient-to-br from-amopark-purple/90 to-amopark-purple/50",
  "bg-gradient-to-br from-amopark-blue/90 to-amopark-blue/50",
  "bg-gradient-to-br from-amopark-green/90 to-amopark-green/50",
  "bg-gradient-to-br from-amopark-yellow/90 to-amopark-yellow/70",
] as const;

function formatEventDate(iso: string): string {
  const norm = normalizeEventDate(iso);
  const [y, m, d] = norm.split("-").map(Number);
  if (!y || !m || !d) return norm;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function slideFromConquista(c: ConquistaRecord): HomeCarouselSlide {
  return {
    id: `conquista-${c.id}`,
    kind: "conquista",
    badge: "Conquista",
    title: c.title,
    subtitle: truncate(c.description, 200) || (c.dateLabel ?? siteConfig.fullName),
    href: ROUTES.noticias,
    ctaLabel: "Ver conquistas",
    imageUrl: null,
    panelClass: CONQUISTA_PANEL[c.colorIndex % CONQUISTA_PANEL.length],
  };
}

function slideFromEvento(e: EventoListItem): HomeCarouselSlide {
  const date = formatEventDate(e.eventDate);
  return {
    id: `evento-${e.id}`,
    kind: "evento",
    badge: e.featuredHome ? "Evento em destaque" : "Próximo evento",
    title: e.title,
    subtitle: truncate(e.summary, 200) || date,
    href: `/eventos/${e.slug}`,
    ctaLabel: "Ver evento",
    imageUrl: e.coverImageUrl,
    panelClass: "bg-gradient-to-br from-amopark-orange/90 to-amopark-orange/55",
  };
}

function slideFromParceiro(p: ParceiroRecord): HomeCarouselSlide {
  return {
    id: `parceiro-${p.id}`,
    kind: "parceiro",
    badge: parceiroBadgeLabel(p.partnerType),
    title: p.name,
    subtitle: truncate(p.summary, 200) || "Parceiro da comunidade North Park",
    href: `/parceiros/${p.slug}`,
    ctaLabel: "Conhecer parceiro",
    imageUrl: p.logoUrl,
    panelClass: "bg-gradient-to-br from-amopark-green/90 to-amopark-green/55",
  };
}

function welcomeSlide(): HomeCarouselSlide {
  return {
    id: "welcome",
    kind: "welcome",
    badge: siteConfig.name,
    title: siteConfig.slogan,
    subtitle: `${siteConfig.fullName} — acompanhe ofícios, eventos e conquistas do bairro.`,
    href: ROUTES.oficios,
    ctaLabel: "Ver ofícios",
    imageUrl: null,
    panelClass: "bg-gradient-to-br from-amopark-blue/90 to-amopark-purple/70",
  };
}

/** Ordem: conquistas, eventos próximos, parceiros publicados. */
export function buildHomeCarouselSlides(input: {
  conquistas: ConquistaRecord[];
  eventos: EventoListItem[];
  parceiros: ParceiroRecord[];
}): HomeCarouselSlide[] {
  const slides: HomeCarouselSlide[] = [
    ...input.conquistas.map(slideFromConquista),
    ...input.eventos.map(slideFromEvento),
    ...input.parceiros.map(slideFromParceiro),
  ];
  if (slides.length === 0) return [welcomeSlide()];
  return slides;
}
