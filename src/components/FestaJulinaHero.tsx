import Image from "next/image";
import { CalendarDays, Sparkles } from "lucide-react";
import type { EventoDetailRecord } from "@/lib/eventos-types";
import { cn } from "@/lib/utils";

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

export function FestaJulinaHero({
  evento,
  isPast = false,
}: {
  evento: EventoDetailRecord;
  isPast?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-amopark-orange/20 bg-gradient-to-br from-amopark-orange/15 via-amopark-yellow/10 to-white">
      {/* Bandeirolas decorativas */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #e65100 0, #e65100 12px, transparent 12px, transparent 24px, #f9a825 24px, #f9a825 36px, transparent 36px, transparent 48px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amopark-orange/15 px-3 py-1 text-sm font-semibold text-amopark-orange">
              <Sparkles className="h-4 w-4" />
              Festa Julina AMOPARK
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-amopark-charcoal sm:text-4xl lg:text-5xl">
              {evento.title}
            </h1>
            {evento.editionLabel && (
              <p className="mt-2 text-lg font-medium text-amopark-purple">
                {evento.editionLabel}
              </p>
            )}
            {evento.summary && (
              <p className="mt-4 max-w-xl text-lg text-amopark-charcoal/85">
                {evento.summary}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-amopark-charcoal/80">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <CalendarDays className="h-4 w-4 text-amopark-orange" />
                <span className="capitalize">{formatEventDate(evento.eventDate)}</span>
              </span>
              {evento.timeNote && (
                <span className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                  {evento.timeNote}
                </span>
              )}
              {isPast && (
                <span className="rounded-full bg-amopark-gray-light px-3 py-1 text-xs font-medium">
                  Edição realizada
                </span>
              )}
            </div>
          </div>

          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-amopark-orange/30 bg-amopark-gray-light/30 shadow-xl",
              !evento.coverImageUrl && "flex items-center justify-center bg-gradient-to-br from-amopark-orange/20 to-amopark-yellow/20"
            )}
          >
            {evento.coverImageUrl ? (
              <Image
                src={evento.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="text-center p-8">
                <Sparkles className="mx-auto h-16 w-16 text-amopark-orange/60" />
                <p className="mt-4 text-sm font-medium text-amopark-charcoal/70">
                  Arraiá do North Park
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FestaJulinaEmBreveHero() {
  return (
    <section className="relative overflow-hidden border-b border-amopark-orange/20 bg-gradient-to-br from-amopark-orange/15 via-amopark-yellow/10 to-white">
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-amopark-orange/15 px-3 py-1 text-sm font-semibold text-amopark-orange">
          <Sparkles className="h-4 w-4" />
          Festa Julina AMOPARK
        </p>
        <h1 className="mt-6 text-3xl font-bold text-amopark-charcoal sm:text-4xl">
          Em breve
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-amopark-charcoal/80">
          Estamos preparando a próxima edição do arraiá do North Park. Volte em breve
          para conferir data, programação e novidades.
        </p>
      </div>
    </section>
  );
}
