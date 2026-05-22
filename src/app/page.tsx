import Link from "next/link";
import { CalendarDays, FileText, Handshake, Trophy } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { ConquistaCard } from "@/components/ConquistaCard";
import { EventoCard } from "@/components/EventoCard";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { ParceiroCard } from "@/components/ParceiroCard";
import { OficioStatusBadge } from "@/components/OficioStatusBadge";
import { getAllConquistas } from "@/lib/conquistas-db";
import { listUpcomingPublishedEventos } from "@/lib/eventos-db";
import { buildHomeCarouselSlides } from "@/lib/home-carousel";
import { listPublishedParceiros } from "@/lib/parceiros-db";
import { listHomeEventoHighlights } from "@/lib/eventos-db";
import { listHomeParceiroHighlights } from "@/lib/parceiros-db";
import { getAllOficios } from "@/lib/oficios-db";
import { formatOficioTableDate } from "@/lib/oficios-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let oficiosRecentes: Awaited<ReturnType<typeof getAllOficios>> = [];
  let ultimasConquistas: Awaited<ReturnType<typeof getAllConquistas>> = [];
  try {
    const all = await getAllOficios();
    oficiosRecentes = all.slice(0, 3);
  } catch {
    oficiosRecentes = [];
  }
  try {
    const conquistas = await getAllConquistas();
    ultimasConquistas = conquistas.slice(0, 3);
  } catch {
    ultimasConquistas = [];
  }

  let eventosDestaque: Awaited<ReturnType<typeof listHomeEventoHighlights>> = [];
  try {
    eventosDestaque = await listHomeEventoHighlights(4);
  } catch {
    eventosDestaque = [];
  }

  let parceirosDestaque: Awaited<ReturnType<typeof listHomeParceiroHighlights>> = [];
  try {
    parceirosDestaque = await listHomeParceiroHighlights(6);
  } catch {
    parceirosDestaque = [];
  }

  let carouselConquistas: Awaited<ReturnType<typeof getAllConquistas>> = [];
  let carouselEventos: Awaited<ReturnType<typeof listUpcomingPublishedEventos>> = [];
  let carouselParceiros: Awaited<ReturnType<typeof listPublishedParceiros>> = [];
  try {
    carouselConquistas = await getAllConquistas();
  } catch {
    carouselConquistas = [];
  }
  try {
    carouselEventos = await listUpcomingPublishedEventos();
  } catch {
    carouselEventos = [];
  }
  try {
    carouselParceiros = await listPublishedParceiros();
  } catch {
    carouselParceiros = [];
  }

  const heroSlides = buildHomeCarouselSlides({
    conquistas: carouselConquistas,
    eventos: carouselEventos,
    parceiros: carouselParceiros,
  });

  return (
    <>
      <HomeHeroCarousel slides={heroSlides} />

      <section className="border-t border-amopark-gray-light bg-amopark-gray-light/30 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal">
                <FileText className="h-7 w-7 text-amopark-blue" />
                Ofícios enviados pela AMOPARK
              </h2>
              <p className="mt-1 text-sm text-amopark-charcoal/70">
                Mural de transparência — últimos registros publicados
              </p>
            </div>
            <Link
              href={ROUTES.oficios}
              className="shrink-0 text-sm font-medium text-amopark-blue hover:underline"
            >
              Ver mural completo
            </Link>
          </div>
          <div className="mt-8 rounded-lg border border-amopark-gray-light bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oficiosRecentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-amopark-charcoal/60 py-10">
                      Nenhum ofício publicado ainda. Os documentos enviados pela diretoria aparecem aqui automaticamente.
                    </TableCell>
                  </TableRow>
                ) : (
                  oficiosRecentes.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {o.numeroOficio?.trim() || "—"}
                      </TableCell>
                      <TableCell>{o.name}</TableCell>
                      <TableCell>{o.destinatario?.trim() || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <OficioStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatOficioTableDate(o.dataOficio, o.createdTime)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {eventosDestaque.length > 0 && (
        <section className="border-t border-amopark-gray-light bg-gradient-to-b from-amopark-orange/10 to-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal">
                <CalendarDays className="h-7 w-7 text-amopark-orange" />
                Próximos eventos
              </h2>
              <Link
                href={ROUTES.eventos}
                className="text-sm font-medium text-amopark-blue hover:underline"
              >
                Calendário completo
              </Link>
            </div>
            <p className="mt-2 text-sm text-amopark-charcoal/75">
              Destaques e datas já confirmadas no North Park.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {eventosDestaque.map((e) => (
                <EventoCard key={e.id} evento={e} highlight={e.featuredHome} />
              ))}
            </div>
          </div>
        </section>
      )}

      {parceirosDestaque.length > 0 && (
        <section className="border-t border-amopark-gray-light bg-gradient-to-b from-amopark-green/10 to-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal">
                <Handshake className="h-7 w-7 text-amopark-green" />
                Parceiros da comunidade
              </h2>
              <Link
                href={ROUTES.parceiros}
                className="text-sm font-medium text-amopark-blue hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <p className="mt-2 text-sm text-amopark-charcoal/75">
              Quem apoia o North Park de forma relevante.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parceirosDestaque.map((p) => (
                <ParceiroCard key={p.id} parceiro={p} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-amopark-gray-light bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal">
              <Trophy className="h-7 w-7 text-amopark-yellow" />
              Últimas Conquistas
            </h2>
            <Link
              href={ROUTES.noticias}
              className="text-sm font-medium text-amopark-blue hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ultimasConquistas.length === 0 ? (
              <p className="col-span-full text-center text-sm text-amopark-charcoal/60 sm:col-span-2 lg:col-span-3">
                Em breve: as conquistas cadastradas pelo painel administrativo aparecerão aqui.
              </p>
            ) : (
              ultimasConquistas.map((c) => (
                <ConquistaCard
                  key={c.id}
                  title={c.title}
                  description={c.description}
                  date={c.dateLabel ?? undefined}
                  colorIndex={c.colorIndex}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
