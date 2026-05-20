import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Trophy } from "lucide-react";
import { siteConfig } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { ConquistaCard } from "@/components/ConquistaCard";
import { EventoCard } from "@/components/EventoCard";
import { OficioStatusBadge } from "@/components/OficioStatusBadge";
import { getAllConquistas } from "@/lib/conquistas-db";
import { listHomeEventoHighlights } from "@/lib/eventos-db";
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

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-amopark-gray-light to-white px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-amopark-charcoal sm:text-4xl lg:text-5xl">
            {siteConfig.slogan}
          </h1>
          <p className="mt-4 text-lg text-amopark-charcoal/80 sm:text-xl">
            {siteConfig.fullName} — canal oficial de transparência e
            comunicação com os moradores do North Park.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ROUTES.transparencia}
              className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-5 py-2.5 font-medium text-white shadow-sm hover:bg-amopark-blue/90 transition-colors"
            >
              Ver Transparência
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.contato}
              className="inline-flex items-center gap-2 rounded-lg border border-amopark-charcoal/20 bg-white px-5 py-2.5 font-medium text-amopark-charcoal hover:bg-amopark-gray-light transition-colors"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {["bg-amopark-red", "bg-amopark-orange", "bg-amopark-purple", "bg-amopark-blue", "bg-amopark-green", "bg-amopark-yellow"].map((c) => (
            <span key={c} className={`h-2 w-2 rounded-full opacity-60 ${c}`} />
          ))}
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

      <section className="border-t border-amopark-gray-light bg-amopark-gray-light/30 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal">
              <FileText className="h-7 w-7 text-amopark-blue" />
              Transparência — Resumo dos Ofícios Enviados
            </h2>
            <Link
              href={ROUTES.transparencia}
              className="text-sm font-medium text-amopark-blue hover:underline"
            >
              Ver todos
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
    </>
  );
}
