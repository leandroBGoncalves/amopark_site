import { Mail, MessageCircle } from "lucide-react";
import { WHATSAPP_PHONE_DISPLAY } from "@/lib/constants";
import { siteConfig } from "@/lib/utils";
import { ContatoForm } from "./ContatoForm";

export const metadata = {
  title: "Contato",
  description: "Canais de atendimento e formulário de contato da AMOPARK.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        Contato
      </h1>
      <p className="mt-2 max-w-2xl text-amopark-charcoal/80">
        Fale com a associação pelo WhatsApp ou envie uma mensagem pelo formulário.
        A diretoria recebe tudo no painel administrativo.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <a
          href={siteConfig.links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm hover:bg-amopark-gray-light/50 transition-colors lg:col-span-1"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amopark-green/10">
            <MessageCircle className="h-6 w-6 text-amopark-green" />
          </div>
          <div>
            <p className="font-semibold text-amopark-charcoal">WhatsApp</p>
            <p className="text-sm text-amopark-charcoal/70">{WHATSAPP_PHONE_DISPLAY}</p>
            <p className="text-sm font-medium text-amopark-green">Enviar mensagem</p>
          </div>
        </a>

        <div className="rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amopark-blue/10">
              <Mail className="h-5 w-5 text-amopark-blue" />
            </div>
            <div>
              <h2 className="font-semibold text-amopark-charcoal">Formulário de contato</h2>
              <p className="text-sm text-amopark-charcoal/70">
                Resposta pela diretoria em alguns dias úteis
              </p>
            </div>
          </div>
          <ContatoForm />
        </div>
      </div>
    </div>
  );
}
