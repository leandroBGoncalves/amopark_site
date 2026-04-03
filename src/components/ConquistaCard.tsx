import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const accentColors = [
  "bg-amopark-red/10 text-amopark-red border-amopark-red/20",
  "bg-amopark-orange/10 text-amopark-orange border-amopark-orange/20",
  "bg-amopark-purple/10 text-amopark-purple border-amopark-purple/20",
  "bg-amopark-blue/10 text-amopark-blue border-amopark-blue/20",
  "bg-amopark-green/10 text-amopark-green border-amopark-green/20",
  "bg-amopark-yellow/10 text-amopark-yellow border-amopark-yellow/30",
];

export interface ConquistaCardProps {
  title: string;
  description: string;
  date?: string;
  colorIndex?: number;
  className?: string;
}

export function ConquistaCard({
  title,
  description,
  date,
  colorIndex = 0,
  className,
}: ConquistaCardProps) {
  const accent = accentColors[colorIndex % accentColors.length];

  return (
    <article
      className={cn(
        "rounded-lg border border-amopark-gray-light bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border",
          accent
        )}
      >
        <Trophy className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-amopark-charcoal">{title}</h3>
      <p className="mt-1 text-sm text-amopark-charcoal/80">{description}</p>
      {date && (
        <p className="mt-2 text-xs text-amopark-charcoal/60">{date}</p>
      )}
    </article>
  );
}
