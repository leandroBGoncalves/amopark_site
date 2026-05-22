import { FileText } from "lucide-react";
import { TransparenciaClient } from "./TransparenciaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Ofícios oficiais",
  description:
    "Mural público de cartas e pedidos formais da AMOPARK — transparência para o bairro acompanhar.",
};

export default function TransparenciaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-amopark-blue">
        Transparência da AMOPARK
      </p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <FileText className="h-8 w-8 text-amopark-blue" />
        Ofícios oficiais
      </h1>
      <p className="mt-2 max-w-3xl text-amopark-charcoal/80">
        Aqui ficam as <strong>cartas e pedidos formais</strong> que a associação enviou à
        prefeitura, empresas e outros órgãos. Publicamos tudo neste mural para o bairro
        acompanhar assunto, destino, situação e o documento completo — isso é a nossa
        transparência.
      </p>
      <TransparenciaClient />
    </div>
  );
}
