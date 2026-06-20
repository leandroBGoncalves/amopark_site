import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { EventoDetailRecord } from "@/lib/eventos-types";
import { isFestaJulinaUpcoming } from "@/lib/festa-julina";

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

export function FestaJulinaHomeBanner({ evento }: { evento: EventoDetailRecord }) {
  const show =
    isFestaJulinaUpcoming(evento.eventDate) || evento.featuredHome;
  if (!show) return null;

  return (
    <section className="border-b border-amopark-orange/25 bg-gradient-to-r from-amopark-orange/15 via-amopark-yellow/10 to-amopark-orange/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {evento.coverImageUrl ? (
            <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-amopark-orange/30 sm:block">
              <Image
                src={evento.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-amopark-orange/20 sm:flex">
              <Sparkles className="h-10 w-10 text-amopark-orange" />
            </div>
          )}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amopark-orange">
              <Sparkles className="h-3.5 w-3.5" />
              Festa Julina
            </p>
            <h2 className="mt-1 text-xl font-bold text-amopark-charcoal sm:text-2xl">
              {evento.title}
            </h2>
            {evento.summary && (
              <p className="mt-2 line-clamp-2 text-sm text-amopark-charcoal/80">
                {evento.summary}
              </p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-amopark-charcoal/70">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="capitalize">{formatEventDate(evento.eventDate)}</span>
              {evento.timeNote && (
                <>
                  <span aria-hidden>·</span>
                  <span>{evento.timeNote}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.festaJulina}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amopark-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amopark-orange/90"
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function FestaJulinaEventosBanner({ evento }: { evento: EventoDetailRecord }) {
  return (
    <div className="mt-10 rounded-xl border border-amopark-orange/30 bg-gradient-to-br from-amopark-orange/10 to-amopark-yellow/5 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amopark-orange">
            <Sparkles className="h-3.5 w-3.5" />
            Página especial
          </p>
          <h2 className="mt-1 text-lg font-bold text-amopark-charcoal">{evento.title}</h2>
          <p className="mt-1 text-sm text-amopark-charcoal/75">
            Detalhes, atualizações, patrocinadores e apoiadores na landing da Festa Julina.
          </p>
        </div>
        <Link
          href={ROUTES.festaJulina}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amopark-orange px-4 py-2 text-sm font-medium text-white hover:bg-amopark-orange/90"
        >
          Ver Festa Julina
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
