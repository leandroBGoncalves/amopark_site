import Link from "next/link";
import { Newspaper } from "lucide-react";
import { ConquistaCard } from "@/components/ConquistaCard";
import { ROUTES } from "@/lib/constants";
import { getAllConquistas } from "@/lib/conquistas-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Notícias e Eventos",
  description: "Mural de conquistas, notícias e eventos do North Park.",
};

export default async function NoticiasPage() {
  let conquistas: Awaited<ReturnType<typeof getAllConquistas>> = [];
  try {
    conquistas = await getAllConquistas();
  } catch {
    conquistas = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <Newspaper className="h-8 w-8 text-amopark-purple" />
        Notícias e Eventos
      </h1>
      <p className="mt-2 text-amopark-charcoal/80">
        Conquistas da associação e do bairro. O{" "}
        <Link href={ROUTES.eventos} className="font-medium text-amopark-blue hover:underline">
          calendário de eventos
        </Link>{" "}
        (arraial, dia do pet, dia das crianças e outros) fica na página Eventos.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-amopark-charcoal">
          Conquistas
        </h2>
        {conquistas.length === 0 ? (
          <p className="mt-4 text-sm text-amopark-charcoal/60">
            Ainda não há conquistas cadastradas. A diretoria pode adicioná-las no{" "}
            <Link href={ROUTES.admin} className="text-amopark-blue hover:underline">
              painel administrativo
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {conquistas.map((c) => (
              <ConquistaCard
                key={c.id}
                title={c.title}
                description={c.description}
                date={c.dateLabel ?? undefined}
                colorIndex={c.colorIndex}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
