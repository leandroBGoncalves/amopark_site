import { Newspaper } from "lucide-react";

export const metadata = {
  title: "Notícias e Eventos",
  description: "Mural de conquistas, notícias e eventos do North Park.",
};

export default function NoticiasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <Newspaper className="h-8 w-8 text-amopark-purple" />
        Notícias e Eventos
      </h1>
      <p className="mt-2 text-amopark-charcoal/80">
        Em breve: mural de conquistas, notícias e eventos do bairro.
      </p>
    </div>
  );
}
