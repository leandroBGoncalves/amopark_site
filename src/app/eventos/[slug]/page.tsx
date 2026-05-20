import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { EventoGallery } from "@/components/EventoGallery";
import { ROUTES } from "@/lib/constants";
import { getPublishedEventoBySlug } from "@/lib/eventos-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatEventDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const ev = await getPublishedEventoBySlug(params.slug).catch(() => null);
  if (!ev) return { title: "Evento" };
  return { title: `${ev.title} | Eventos AMOPARK` };
}

export default async function EventoDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let ev: Awaited<ReturnType<typeof getPublishedEventoBySlug>> = null;
  try {
    ev = await getPublishedEventoBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!ev) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const isPast = ev.eventDate < today;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={ROUTES.eventos}
        className="inline-flex items-center gap-2 text-sm font-medium text-amopark-blue hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos os eventos
      </Link>

      {ev.coverImageUrl && (
        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-xl border border-amopark-gray-light bg-amopark-gray-light/30">
          <Image
            src={ev.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <header className={ev.coverImageUrl ? "mt-8" : "mt-8"}>
        <p className="flex flex-wrap items-center gap-2 text-sm text-amopark-charcoal/70">
          <CalendarDays className="h-4 w-4" />
          <span className="capitalize">{formatEventDate(ev.eventDate)}</span>
          {ev.timeNote && (
            <>
              <span>·</span>
              <span>{ev.timeNote}</span>
            </>
          )}
          {isPast && (
            <span className="rounded-full bg-amopark-gray-light px-2 py-0.5 text-xs">
              Realizado
            </span>
          )}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-amopark-charcoal sm:text-4xl">
          {ev.title}
        </h1>
        {ev.editionLabel && (
          <p className="mt-2 text-lg font-medium text-amopark-purple">
            {ev.editionLabel}
          </p>
        )}
        {ev.summary && (
          <p className="mt-4 text-lg text-amopark-charcoal/85">{ev.summary}</p>
        )}
      </header>

      {ev.body?.trim() && (
        <div className="prose prose-sm mt-8 max-w-none text-amopark-charcoal/90 sm:prose-base whitespace-pre-wrap">
          {ev.body}
        </div>
      )}

      <EventoGallery midias={ev.midias} className="mt-12" />
    </article>
  );
}
