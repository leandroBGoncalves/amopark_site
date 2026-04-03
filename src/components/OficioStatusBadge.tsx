import { cn } from "@/lib/utils";
import type { OficioStatusValue } from "@/lib/oficios-status";
import { oficioStatusLabel, parseOficioStatus } from "@/lib/oficios-status";

export function OficioStatusBadge({
  status,
  className,
}: {
  status: OficioStatusValue | string;
  className?: string;
}) {
  const v = parseOficioStatus(status);
  const label = oficioStatusLabel(v);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        (v === "respondido" || v === "atendido") &&
          "bg-amopark-green/10 text-amopark-green",
        v === "nao_atendido" && "bg-red-100 text-red-800",
        v === "nao_respondido" && "bg-amber-100 text-amber-900",
        v === "em_analise" && "bg-amopark-orange/10 text-amopark-orange",
        v === "enviado" && "bg-amopark-gray-light text-amopark-charcoal/80",
        className
      )}
    >
      {label}
    </span>
  );
}
