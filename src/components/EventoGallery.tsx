import type { EventoMidiaRecord } from "@/lib/eventos-types";
import { cn } from "@/lib/utils";

export function EventoGallery({
  midias,
  className,
}: {
  midias: EventoMidiaRecord[];
  className?: string;
}) {
  if (midias.length === 0) return null;

  return (
    <div className={cn("space-y-8", className)}>
      <h2 className="text-lg font-semibold text-amopark-charcoal">
        Fotos e vídeos
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {midias.map((m) => (
          <li key={m.id} className="space-y-2">
            {m.kind === "image" ? (
              <div className="relative overflow-hidden rounded-lg border border-amopark-gray-light bg-amopark-gray-light/20">
                <img
                  src={m.url}
                  alt={m.caption || "Foto do evento"}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
                {m.isCover && (
                  <span className="absolute left-2 top-2 rounded-full bg-amopark-orange px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                    Capa
                  </span>
                )}
              </div>
            ) : (
              <div className="aspect-video overflow-hidden rounded-lg border border-amopark-gray-light bg-black">
                <iframe
                  title={m.caption || "Vídeo do evento"}
                  src={m.url}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {m.caption && (
              <p className="text-sm text-amopark-charcoal/70">{m.caption}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
