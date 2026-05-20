import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { EventoCard } from "@/components/EventoCard";
import { EventosCalendario } from "@/components/EventosCalendario";
import { ROUTES } from "@/lib/constants";
import { calendarInitialView, todayIsoLocal } from "@/lib/evento-calendar";
import { listPublishedEventos } from "@/lib/eventos-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Eventos",
  description:
    "Eventos tradicionais e próximas datas no North Park — arraiá, dia do pet, dia das crianças e mais.",
};

export default async function EventosPage() {
  let all: Awaited<ReturnType<typeof listPublishedEventos>> = [];
  try {
    all = await listPublishedEventos();
  } catch {
    all = [];
  }

  const today = todayIsoLocal();
  const upcoming = all
    .filter((e) => e.eventDate >= today)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = all
    .filter((e) => e.eventDate < today)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  const destaque = upcoming.filter((e) => e.featuredHome);
  const outrosProximos = upcoming.filter((e) => !e.featuredHome);
  const calView = calendarInitialView(all, today);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <CalendarDays className="h-8 w-8 shrink-0 text-amopark-orange" />
        Eventos no North Park
      </h1>
      <p className="mt-3 max-w-3xl text-amopark-charcoal/85">
        Acompanhe as tradicionais festas e ações do bairro — com fotos e vídeos das
        edições anteriores — e fique por dentro das próximas datas.
      </p>

      <EventosCalendario
        eventos={all}
        initialYear={calView.year}
        initialMonth={calView.month}
        initialSelectedIso={calView.selectedIso}
        className="mt-10"
      />

      {upcoming.length === 0 && past.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-amopark-gray-light bg-amopark-gray-light/20 px-6 py-5 text-center text-sm text-amopark-charcoal/70">
          Ainda não há eventos publicados. A diretoria cadastra datas, textos, fotos e
          vídeos pelo{" "}
          <Link href={ROUTES.admin} className="font-medium text-amopark-blue hover:underline">
            painel administrativo
          </Link>{" "}
          (aba <strong>Eventos</strong>).
        </p>
      ) : (
        <>
          {(destaque.length > 0 || outrosProximos.length > 0) && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-amopark-charcoal">
                Próximos eventos
              </h2>
              <p className="mt-1 text-sm text-amopark-charcoal/70">
                Destaques na home e demais datas já confirmadas.
              </p>

              {destaque.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-amopark-blue">
                    Em destaque
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {destaque.map((e) => (
                      <EventoCard key={e.id} evento={e} highlight />
                    ))}
                  </div>
                </div>
              )}

              {outrosProximos.length > 0 && (
                <div className={destaque.length > 0 ? "mt-10" : ""}>
                  {destaque.length > 0 && (
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-amopark-charcoal/80">
                      Outras datas
                    </h3>
                  )}
                  <div
                    className={
                      destaque.length > 0
                        ? "mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        : "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    }
                  >
                    {outrosProximos.map((e) => (
                      <EventoCard key={e.id} evento={e} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {past.length > 0 && (
            <section className="mt-14 border-t border-amopark-gray-light pt-12">
              <h2 className="text-xl font-bold text-amopark-charcoal">
                Eventos realizados
              </h2>
              <p className="mt-1 text-sm text-amopark-charcoal/70">
                Relatos, fotos e vídeos das edições passadas.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((e) => (
                  <EventoCard key={e.id} evento={e} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href={ROUTES.noticias}
          className="inline-flex items-center gap-2 text-sm font-medium text-amopark-blue hover:underline"
        >
          Ver conquistas e notícias
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
