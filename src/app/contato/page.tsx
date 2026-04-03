import { Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/utils";

export const metadata = {
  title: "Contato",
  description: "Canais de atendimento da AMOPARK.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        Contato
      </h1>
      <p className="mt-2 text-amopark-charcoal/80">
        Entre em contato com a associação pelos canais abaixo.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <a
          href={siteConfig.links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-lg border border-amopark-gray-light bg-white p-6 shadow-sm hover:bg-amopark-gray-light/50 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amopark-green/10">
            <MessageCircle className="h-6 w-6 text-amopark-green" />
          </div>
          <div>
            <p className="font-semibold text-amopark-charcoal">WhatsApp</p>
            <p className="text-sm text-amopark-charcoal/70">Envie uma mensagem</p>
          </div>
        </a>
        <div className="flex items-center gap-4 rounded-lg border border-amopark-gray-light bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amopark-blue/10">
            <Mail className="h-6 w-6 text-amopark-blue" />
          </div>
          <div>
            <p className="font-semibold text-amopark-charcoal">Formulário</p>
            <p className="text-sm text-amopark-charcoal/70">
              Em breve: formulário de contato
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
