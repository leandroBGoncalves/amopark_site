import { MessageSquareWarning } from "lucide-react";
import { FaleConoscoForm } from "./FaleConoscoForm";

export const metadata = {
  title: "Sugestões, reclamações e dúvidas",
  description:
    "Canal da AMOPARK para sugestões, reclamações e dúvidas dos moradores do North Park.",
};

export default function FaleConoscoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <MessageSquareWarning className="h-8 w-8 text-amopark-purple" />
        Sugestões, reclamações e dúvidas
      </h1>
      <p className="mt-3 text-amopark-charcoal/85">
        Este canal é para moradores enviarem ideias, relatar problemas ou tirar dúvidas
        sobre a associação e o bairro. A diretoria recebe sua mensagem por e-mail e responde
        pelo painel administrativo — você também recebe avisos no e-mail informado.
      </p>

      <div className="mt-8 rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm sm:p-8">
        <FaleConoscoForm />
      </div>
    </div>
  );
}
