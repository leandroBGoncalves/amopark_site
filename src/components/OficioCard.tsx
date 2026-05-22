import { Building2, Calendar, ExternalLink, FileText, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { OficioStatusBadge } from "@/components/OficioStatusBadge";
import type { OficioStatusValue } from "@/lib/oficios-status";
import { formatOficioListDate } from "@/lib/oficios-display";

export interface OficioCardProps {
  title: string;
  createdTime: string;
  dataOficio: string | null;
  summary: string;
  numeroOficio: string | null;
  destinatario: string | null;
  status: OficioStatusValue;
  webViewLink: string;
  className?: string;
}

export function OficioCard({
  title,
  createdTime,
  dataOficio,
  summary,
  numeroOficio,
  destinatario,
  status,
  webViewLink,
  className,
}: OficioCardProps) {
  const numero = numeroOficio?.trim();
  const dest = destinatario?.trim();

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-amopark-gray-light bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OficioStatusBadge status={status} />
        <p className="flex items-center gap-1.5 text-xs text-amopark-charcoal/60">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {formatOficioListDate(dataOficio, createdTime)}
        </p>
      </div>

      {(numero || dest) && (
        <div className="mt-3 space-y-2 rounded-lg bg-amopark-gray-light/50 px-3 py-2.5">
          {numero && (
            <p className="flex items-start gap-2 text-sm">
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-amopark-blue" />
              <span>
                <span className="font-medium text-amopark-charcoal/70">Número: </span>
                <span className="font-semibold text-amopark-charcoal">{numero}</span>
              </span>
            </p>
          )}
          {dest && (
            <p className="flex items-start gap-2 text-sm">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-amopark-purple" />
              <span>
                <span className="font-medium text-amopark-charcoal/70">Enviado para: </span>
                <span className="font-semibold text-amopark-charcoal">{dest}</span>
              </span>
            </p>
          )}
        </div>
      )}

      <h3 className="mt-3 text-lg font-semibold leading-snug text-amopark-charcoal">
        {title}
      </h3>

      {summary?.trim() && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-amopark-charcoal/80">
          {summary}
        </p>
      )}

      <a
        href={webViewLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amopark-blue px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-amopark-blue/90 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Abrir documento
        <ExternalLink className="h-4 w-4" />
      </a>
    </article>
  );
}
