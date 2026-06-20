import Image from "next/image";
import { ImageIcon, Play, Video } from "lucide-react";
import type { EventoMidiaRecord } from "@/lib/eventos-types";
import { cn } from "@/lib/utils";

function VideoEmbed({
  midia,
  prominent = false,
}: {
  midia: EventoMidiaRecord;
  prominent?: boolean;
}) {
  return (
    <figure className="space-y-3">
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-black shadow-md transition-shadow hover:shadow-lg",
          prominent
            ? "border-amopark-orange/40 ring-2 ring-amopark-orange/15"
            : "border-amopark-gray-light"
        )}
      >
        <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Play className="h-3.5 w-3.5 fill-current" />
          Vídeo
        </div>
        <div className={cn("aspect-video w-full", prominent && "sm:aspect-[16/9]")}>
          <iframe
            title={midia.caption || "Vídeo do evento"}
            src={midia.url}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      {midia.caption && (
        <figcaption className="text-sm font-medium text-amopark-charcoal/80">
          {midia.caption}
        </figcaption>
      )}
    </figure>
  );
}

function PhotoTile({ midia }: { midia: EventoMidiaRecord }) {
  return (
    <li className="space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-amopark-gray-light bg-amopark-gray-light/20">
        <Image
          src={midia.url}
          alt={midia.caption || "Foto do evento"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {midia.isCover && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-amopark-orange px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            Capa
          </span>
        )}
      </div>
      {midia.caption && (
        <p className="text-sm text-amopark-charcoal/70">{midia.caption}</p>
      )}
    </li>
  );
}

export function EventoGallery({
  midias,
  className,
}: {
  midias: EventoMidiaRecord[];
  className?: string;
}) {
  if (midias.length === 0) return null;

  const videos = midias.filter((m) => m.kind === "video_embed");
  const photos = midias.filter((m) => m.kind === "image");
  const hasBoth = videos.length > 0 && photos.length > 0;

  return (
    <div className={cn("space-y-10", className)}>
      {videos.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-amopark-charcoal sm:text-2xl">
            <Video className="h-6 w-6 text-amopark-orange sm:h-7 sm:w-7" />
            {videos.length === 1 ? "Vídeo do evento" : "Vídeos do evento"}
          </h2>
          {hasBoth && (
            <p className="mt-1 text-sm text-amopark-charcoal/65">
              Assista aos registros em vídeo desta edição.
            </p>
          )}

          {videos.length === 1 ? (
            <div className="mt-6 mx-auto max-w-4xl">
              <VideoEmbed midia={videos[0]!} prominent />
            </div>
          ) : (
            <ul className="mt-6 grid gap-8 lg:grid-cols-2">
              {videos.map((m) => (
                <li key={m.id}>
                  <VideoEmbed midia={m} prominent={videos.length <= 2} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {photos.length > 0 && (
        <section className={videos.length > 0 ? "border-t border-amopark-gray-light pt-10" : ""}>
          <h2
            className={cn(
              "flex items-center gap-2 font-semibold text-amopark-charcoal",
              videos.length > 0 ? "text-lg" : "text-xl sm:text-2xl"
            )}
          >
            <ImageIcon
              className={cn(
                "text-amopark-blue",
                videos.length > 0 ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
              )}
            />
            {photos.length === 1 ? "Foto do evento" : "Fotos do evento"}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((m) => (
              <PhotoTile key={m.id} midia={m} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
