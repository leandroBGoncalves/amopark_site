import {
  notifySubscribersOfEvento,
  type EventoNotifyKind,
} from "./content-broadcast-emails";

export function scheduleEventoSubscriberNotify(
  evento: {
    slug: string;
    title: string;
    summary: string;
    eventDate: string;
    timeNote: string | null;
    published: boolean;
  },
  kind: EventoNotifyKind,
  logContext: string
): void {
  if (!evento.published) return;

  void notifySubscribersOfEvento(
    {
      slug: evento.slug,
      title: evento.title,
      summary: evento.summary,
      eventDate: evento.eventDate,
      timeNote: evento.timeNote,
    },
    kind
  ).catch((err) => {
    console.error(`${logContext}: aviso newsletter:`, err);
  });
}
