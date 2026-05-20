import Image from "next/image";
import Link from "next/link";
import { Calendar, Star } from "lucide-react";
import type { EventoListItem } from "@/lib/eventos-types";
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

export function EventoCard({
  evento,
  highlight = false,
  className,
}: {
  evento: EventoListItem;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/eventos/${evento.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-amopark-gray-light bg-white shadow-sm transition-shadow hover:shadow-md",
        highlight && "border-amopark-blue/30",
        className
      )}
    >
      {evento.coverImageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-amopark-gray-light/30">
          <Image
            src={evento.coverImageUrl}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {evento.featuredHome && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-amopark-charcoal shadow-sm">
              <Star className="h-3.5 w-3.5 text-amopark-yellow" />
              Destaque
            </span>
          )}
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-1 flex-col p-5",
          highlight && !evento.coverImageUrl && "bg-gradient-to-br from-amopark-blue/5 to-white"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-amopark-charcoal group-hover:text-amopark-blue transition-colors">
            {evento.title}
          </h3>
          {evento.featuredHome && !evento.coverImageUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amopark-yellow/25 px-2 py-0.5 text-xs font-medium text-amopark-charcoal">
              <Star className="h-3.5 w-3.5 text-amopark-yellow" />
              Destaque
            </span>
          )}
        </div>
        {evento.editionLabel && (
          <p className="mt-1 text-sm font-medium text-amopark-purple">
            {evento.editionLabel}
          </p>
        )}
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-amopark-charcoal/80">
          {evento.summary}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-amopark-charcoal/60">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{formatEventDate(evento.eventDate)}</span>
          {evento.timeNote && (
            <>
              <span aria-hidden>·</span>
              <span>{evento.timeNote}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
