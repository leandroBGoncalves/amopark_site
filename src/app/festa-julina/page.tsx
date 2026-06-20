import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { EventoGallery } from "@/components/EventoGallery";
import { EventoParceirosSection } from "@/components/EventoParceirosSection";
import {
  FestaJulinaEmBreveHero,
  FestaJulinaHero,
} from "@/components/FestaJulinaHero";
import { HomeNewsletterCta } from "@/components/HomeNewsletterCta";
import { ROUTES, WHATSAPP_URL } from "@/lib/constants";
import { loadFestaJulinaPageData } from "@/lib/festa-julina";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const { evento } = await loadFestaJulinaPageData();
  if (!evento) {
    return {
      title: "Festa Julina | AMOPARK",
      description:
        "Em breve: arraiá, quadrilha e muita diversão no North Park. Acompanhe novidades da Festa Julina AMOPARK.",
    };
  }
  return {
    title: `${evento.title} | Festa Julina AMOPARK`,
    description:
      evento.summary ||
      "Detalhes, patrocinadores e apoiadores da Festa Julina no North Park.",
  };
}

function CtaSection() {
  return (
    <section className="border-t border-amopark-gray-light bg-amopark-orange/5 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-xl font-bold text-amopark-charcoal">Fique por dentro</h2>
        <p className="mt-2 text-amopark-charcoal/80">
          Dúvidas sobre a festa ou interesse em apoiar? Fale conosco.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-amopark-green px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amopark-green/90"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp AMOPARK
          </a>
          <Link
            href={ROUTES.contato}
            className="inline-flex items-center gap-2 rounded-lg border border-amopark-gray-light bg-white px-5 py-2.5 text-sm font-medium text-amopark-charcoal shadow-sm transition hover:border-amopark-blue/40"
          >
            Formulário de contato
          </Link>
        </div>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-amopark-charcoal/70">
          <Bell className="h-4 w-4" />
          Inscreva-se na newsletter abaixo para receber novidades do evento.
        </p>
      </div>
    </section>
  );
}

export default async function FestaJulinaPage() {
  const { evento } = await loadFestaJulinaPageData();

  if (!evento) {
    return (
      <>
        <FestaJulinaEmBreveHero />
        <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-amopark-charcoal/75">
            No admin, abra o evento da Festa Julina, marque{" "}
            <strong>Página especial Festa Julina</strong> e salve. Os dados já
            cadastrados (texto, fotos, patrocinadores) aparecerão aqui
            automaticamente.
          </p>
        </section>
        <HomeNewsletterCta />
      </>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const isPast = evento.eventDate < today;

  return (
    <>
      <FestaJulinaHero evento={evento} isPast={isPast} />

      {(evento.body?.trim() || evento.summary) && (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-amopark-charcoal">Sobre o evento</h2>
          {evento.summary && !evento.body?.trim() && (
            <p className="mt-4 text-lg text-amopark-charcoal/85">{evento.summary}</p>
          )}
          {evento.body?.trim() && (
            <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-amopark-charcoal/90 sm:prose-base">
              {evento.body}
            </div>
          )}
        </section>
      )}

      <EventoParceirosSection
        parceiros={evento.parceiros}
        title="Quem apoia a festa"
      />

      {evento.midias.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <EventoGallery midias={evento.midias} />
        </section>
      )}

      <CtaSection />
      <HomeNewsletterCta />
    </>
  );
}
