"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Landmark,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { HomeCarouselSlide, HomeCarouselSlideKind } from "@/lib/home-carousel";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 7000;

const kindIcons: Record<HomeCarouselSlideKind, LucideIcon> = {
  conquista: Trophy,
  evento: CalendarDays,
  parceiro: Handshake,
  welcome: Trophy,
};

function ParceiroKindIcon({
  badge,
  className,
}: {
  badge: string;
  className?: string;
}) {
  if (badge.includes("Empresa")) return <Building2 className={className} />;
  if (badge.includes("Político")) return <Landmark className={className} />;
  if (badge.includes("Cidadão")) return <UserRound className={className} />;
  return <Handshake className={className} />;
}

function SlideVisual({ slide }: { slide: HomeCarouselSlide }) {
  const Icon = kindIcons[slide.kind];

  if (slide.imageUrl) {
    return (
      <div className="relative mx-auto aspect-[16/10] w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/25 lg:aspect-[4/3] lg:max-w-none">
        <Image
          src={slide.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 90vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto flex aspect-[16/10] w-full max-w-xl items-center justify-center overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20 lg:aspect-[4/3] lg:max-w-none",
        slide.panelClass
      )}
    >
      {slide.kind === "parceiro" ? (
        <ParceiroKindIcon badge={slide.badge} className="h-24 w-24 text-white/90 sm:h-32 sm:w-32" />
      ) : (
        <Icon className="h-24 w-24 text-white/90 sm:h-32 sm:w-32" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
    </div>
  );
}

export function HomeHeroCarousel({ slides }: { slides: HomeCarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = slides[index] ?? slides[0];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => go(index + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [count, paused, index, go]);

  if (!current || count === 0) return null;

  const hasImageBg = Boolean(current.imageUrl);

  return (
    <section
      className="relative min-h-[520px] overflow-hidden bg-amopark-charcoal sm:min-h-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques da AMOPARK"
    >
      {hasImageBg && (
        <div className="absolute inset-0 lg:hidden" aria-hidden>
          <Image
            src={current.imageUrl!}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
        </div>
      )}
      <div
        className="absolute inset-0 bg-gradient-to-r from-amopark-charcoal via-amopark-charcoal/95 to-amopark-charcoal/80 lg:from-amopark-charcoal lg:via-amopark-charcoal/90 lg:to-amopark-charcoal/40"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16 lg:pl-8">
        <div key={current.id} className="z-10 text-center lg:text-left">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/95 backdrop-blur-sm">
            {current.badge}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {current.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
            {current.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={current.href}
              className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-5 py-2.5 font-medium text-white shadow-lg hover:bg-amopark-blue/90 transition-colors"
            >
              {current.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.contato}
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-5 py-2.5 font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              Fale Conosco
            </Link>
          </div>
        </div>

        <div key={`vis-${current.id}`} className="relative z-10 hidden lg:block">
          <SlideVisual slide={current} />
        </div>
        <div key={`vis-m-${current.id}`} className="relative z-10 lg:hidden">
          <SlideVisual slide={current} />
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm hover:bg-black/50 sm:left-4"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm hover:bg-black/50 sm:right-4"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium tabular-nums text-white/80">
            {index + 1} de {count}
          </p>
          {count > 1 && (
            <div
              className="flex max-w-full items-center justify-center gap-2 overflow-x-auto pb-0.5 sm:justify-end"
              role="tablist"
              aria-label={`Slides do carrossel (${count})`}
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`${s.title}, slide ${i + 1} de ${count}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 shrink-0 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
