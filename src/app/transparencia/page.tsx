import { FileText } from "lucide-react";
import { TransparenciaClient } from "./TransparenciaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Transparência",
  description: "Petições e ofícios da AMOPARK — acompanhamento de status.",
};

export default function TransparenciaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <FileText className="h-8 w-8 text-amopark-blue" />
        Transparência
      </h1>
      <p className="mt-2 text-amopark-charcoal/80">
        Ofícios e solicitações publicados pela diretoria.
      </p>
      <TransparenciaClient />
    </div>
  );
}
