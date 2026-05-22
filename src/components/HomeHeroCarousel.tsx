"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeCarouselSlide, HomeCarouselSlideKind } from "@/lib/home-carousel";
import { ROUTES } from "@/lib/constants";
import { cn, siteConfig } from "@/lib/utils";

const AMOPARK_LOGO = "/logo-amopark.png";

const INTERVAL_MS = 7000;

/** Fundo suave por tipo de slide — alinhado às seções da home */
const kindBackground: Record<HomeCarouselSlideKind, string> = {
  conquista:
    "bg-gradient-to-br from-amopark-blue/[0.07] via-white to-amopark-gray-light",
  evento:
    "bg-gradient-to-br from-amopark-orange/10 via-white to-amopark-gray-light",
  parceiro:
    "bg-gradient-to-br from-amopark-green/10 via-white to-amopark-gray-light",
  welcome: "bg-gradient-to-b from-amopark-gray-light to-white",
};

function SlideVisual({ slide }: { slide: HomeCarouselSlide }) {
  const hasPhoto = Boolean(slide.imageUrl?.trim());

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-xl overflow-hidden rounded-2xl border border-amopark-gray-light bg-gradient-to-br from-white to-amopark-gray-light shadow-xl lg:aspect-[4/3] lg:max-w-none">
      {hasPhoto ? (
        <>
          <Image
            src={slide.imageUrl!}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 90vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-14">
          <Image
            src={AMOPARK_LOGO}
            alt={`Logo ${siteConfig.name}`}
            width={240}
            height={240}
            className="h-auto w-full max-w-[200px] object-contain sm:max-w-[240px]"
            priority
          />
        </div>
      )}
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

  return (
    <section
      className={cn(
        "relative min-h-[520px] overflow-hidden border-b border-amopark-gray-light transition-colors duration-700 sm:min-h-[560px]",
        kindBackground[current.kind]
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques da AMOPARK"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amopark-blue/[0.04] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amopark-orange/[0.06] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-16">
        <div key={current.id} className="z-10 text-center lg:text-left">
          <p className="inline-flex rounded-full border border-amopark-blue/20 bg-amopark-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amopark-blue">
            {current.badge}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-amopark-charcoal sm:text-4xl lg:text-[2.75rem]">
            {current.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-amopark-charcoal/80 sm:text-lg">
            {current.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={current.href}
              className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-5 py-2.5 font-medium text-white shadow-sm hover:bg-amopark-blue/90 transition-colors"
            >
              {current.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.contato}
              className="inline-flex items-center gap-2 rounded-lg border border-amopark-charcoal/15 bg-white px-5 py-2.5 font-medium text-amopark-charcoal shadow-sm hover:bg-amopark-gray-light transition-colors"
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
            className="absolute left-2 top-[42%] z-20 -translate-y-1/2 rounded-full border border-amopark-gray-light bg-white/95 p-2.5 text-amopark-charcoal shadow-md hover:bg-white sm:left-4"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-[42%] z-20 -translate-y-1/2 rounded-full border border-amopark-gray-light bg-white/95 p-2.5 text-amopark-charcoal shadow-md hover:bg-white sm:right-4"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-amopark-gray-light/80 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium tabular-nums text-amopark-charcoal/65">
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
                    i === index
                      ? "w-8 bg-amopark-blue"
                      : "w-2 bg-amopark-charcoal/25 hover:bg-amopark-charcoal/40"
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
