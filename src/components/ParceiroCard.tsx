import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Handshake,
  Landmark,
  UserRound,
} from "lucide-react";
import type { ParceiroRecord } from "@/lib/parceiros-types";
import { PARCEIRO_TYPE_LABELS } from "@/lib/parceiros-types";
import { cn } from "@/lib/utils";

const typeIcons = {
  empresa: Building2,
  entidade: Handshake,
  politico: Landmark,
  cidadao: UserRound,
} as const;

export function ParceiroCard({
  parceiro,
  compact = false,
  className,
}: {
  parceiro: ParceiroRecord;
  compact?: boolean;
  className?: string;
}) {
  const Icon = typeIcons[parceiro.partnerType];
  const typeLabel = PARCEIRO_TYPE_LABELS[parceiro.partnerType];

  return (
    <Link
      href={`/parceiros/${parceiro.slug}`}
      className={cn(
        "group flex gap-4 rounded-xl border border-amopark-gray-light bg-white p-4 shadow-sm transition-shadow hover:border-amopark-blue/30 hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amopark-gray-light bg-white",
          compact ? "h-14 w-14" : "h-20 w-20"
        )}
      >
        {parceiro.logoUrl ? (
          <Image
            src={parceiro.logoUrl}
            alt=""
            width={compact ? 56 : 80}
            height={compact ? 56 : 80}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Icon
            className={cn(
              "text-amopark-charcoal/40",
              compact ? "h-7 w-7" : "h-9 w-9"
            )}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-amopark-blue">
          {typeLabel}
        </p>
        <h3
          className={cn(
            "font-semibold text-amopark-charcoal group-hover:text-amopark-blue transition-colors",
            compact ? "text-sm" : "text-base"
          )}
        >
          {parceiro.name}
        </h3>
        {parceiro.summary && !compact && (
          <p className="mt-1 line-clamp-3 text-sm text-amopark-charcoal/75">
            {parceiro.summary}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amopark-blue">
          Ver perfil
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
