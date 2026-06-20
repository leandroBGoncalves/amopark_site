import Link from "next/link";
import { HelpCircle, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function HomeFaleConoscoCta() {
  return (
    <section
      className="border-t border-amopark-gray-light bg-gradient-to-br from-amopark-purple/10 via-white to-amopark-orange/5 px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="fale-conosco-cta-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2
            id="fale-conosco-cta-heading"
            className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl"
          >
            <MessageSquareWarning className="h-8 w-8 shrink-0 text-amopark-purple" />
            Sugestões, reclamações e dúvidas
          </h2>
          <p className="mt-3 text-amopark-charcoal/85">
            Tem uma ideia para melhorar o bairro, quer relatar um problema ou tirar uma dúvida
            sobre a associação? Use nosso canal de ouvidoria — você recebe um protocolo e avisos
            por e-mail quando a diretoria responder.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-amopark-charcoal/80">
            <li className="flex items-start gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amopark-blue" />
              Dúvidas sobre eventos, taxas ou funcionamento da AMOPARK
            </li>
            <li className="flex items-start gap-2">
              <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0 text-amopark-orange" />
              Reclamações sobre infraestrutura ou convivência no North Park
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amopark-green" />
              Sugestões para melhorar a comunidade — sua voz importa
            </li>
          </ul>
        </div>

        <div className="shrink-0 rounded-xl border border-amopark-purple/20 bg-white p-6 shadow-sm sm:p-8 lg:max-w-sm lg:text-center">
          <p className="text-sm text-amopark-charcoal/75">
            Formulário rápido, com confirmação automática por e-mail para você e aviso à diretoria.
          </p>
          <Link
            href={ROUTES.faleConosco}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-amopark-purple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amopark-purple/90 sm:w-auto"
          >
            Enviar mensagem
          </Link>
        </div>
      </div>
    </section>
  );
}
