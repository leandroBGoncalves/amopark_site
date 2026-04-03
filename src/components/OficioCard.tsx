import { FileText, Calendar, Building2, ExternalLink } from "lucide-react";
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
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-amopark-gray-light bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amopark-blue/10 text-amopark-blue">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-amopark-charcoal line-clamp-2">
              {title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-amopark-charcoal/60">
              <Calendar className="h-3.5 w-3.5" />
              {formatOficioListDate(dataOficio, createdTime)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <OficioStatusBadge status={status} />
          <a
            href={webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-amopark-blue hover:bg-amopark-blue/10 transition-colors"
          >
            Ver documento
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {(numeroOficio || destinatario) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {numeroOficio && (
            <span className="inline-flex items-center rounded-full bg-amopark-gray-light px-2.5 py-0.5 text-xs font-medium text-amopark-charcoal">
              {numeroOficio}
            </span>
          )}
          {destinatario && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amopark-purple/10 px-2.5 py-0.5 text-xs font-medium text-amopark-purple">
              <Building2 className="h-3 w-3" />
              {destinatario}
            </span>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-amopark-charcoal/85 leading-relaxed">
        {summary}
      </p>
    </article>
  );
}
