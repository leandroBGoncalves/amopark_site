import { FESTA_JULINA_EVENT_SLUG, ROUTES } from "./constants";
import type { EventoDetailRecord, EventoListItem } from "./eventos-types";
import { getFestaJulinaLandingEvent } from "./eventos-db";

export { FESTA_JULINA_EVENT_SLUG };

export function isFestaJulinaLanding(
  evento: Pick<EventoListItem, "festaJulinaLanding">
): boolean {
  return evento.festaJulinaLanding;
}

export function getEventoPublicHref(
  evento: Pick<EventoListItem, "slug" | "festaJulinaLanding">
): string {
  return evento.festaJulinaLanding ? ROUTES.festaJulina : `/eventos/${evento.slug}`;
}

export function isFestaJulinaUpcoming(eventDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return eventDate >= today;
}

export async function getFestaJulinaPublishedEvent(): Promise<EventoDetailRecord | null> {
  try {
    return await getFestaJulinaLandingEvent();
  } catch {
    return null;
  }
}

export async function loadFestaJulinaPageData() {
  const evento = await getFestaJulinaPublishedEvent();
  return {
    evento,
    parceiros: evento?.parceiros ?? { patrocinadores: [], apoiadores: [] },
  };
}
