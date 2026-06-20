import Link from "next/link";
import { Handshake } from "lucide-react";
import { ParceiroCard } from "@/components/ParceiroCard";
import { ROUTES } from "@/lib/constants";
import type { EventoParceirosGrouped } from "@/lib/eventos-types";

export function EventoParceirosSection({
  parceiros,
  title = "Quem apoia este evento",
  showParceirosLink = true,
  embedded = false,
}: {
  parceiros: EventoParceirosGrouped;
  title?: string;
  showParceirosLink?: boolean;
  embedded?: boolean;
}) {
  const { patrocinadores, apoiadores } = parceiros;
  const hasAny = patrocinadores.length > 0 || apoiadores.length > 0;
  if (!hasAny) return null;

  const inner = (
    <>
      <h2 className="flex items-center gap-2 text-xl font-bold text-amopark-charcoal sm:text-2xl">
        <Handshake className="h-6 w-6 text-amopark-green sm:h-7 sm:w-7" />
        {title}
      </h2>

      {patrocinadores.length > 0 && (
        <div className={embedded ? "mt-6" : "mt-10"}>
          <h3 className="text-lg font-semibold text-amopark-charcoal">Patrocinadores</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {patrocinadores.map((p) => (
              <ParceiroCard key={p.id} parceiro={p} compact />
            ))}
          </div>
        </div>
      )}

      {apoiadores.length > 0 && (
        <div className={patrocinadores.length > 0 ? "mt-10" : embedded ? "mt-6" : "mt-10"}>
          <h3 className="text-lg font-semibold text-amopark-charcoal">Apoiadores</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {apoiadores.map((p) => (
              <ParceiroCard key={p.id} parceiro={p} compact />
            ))}
          </div>
        </div>
      )}

      {showParceirosLink && (
        <p className="mt-8 text-sm text-amopark-charcoal/65">
          Conheça todos os parceiros da comunidade na{" "}
          <Link href={ROUTES.parceiros} className="font-medium text-amopark-blue hover:underline">
            página de parceiros
          </Link>
          .
        </p>
      )}
    </>
  );

  if (embedded) {
    return <div className="mt-12 border-t border-amopark-gray-light pt-12">{inner}</div>;
  }

  return (
    <section className="border-t border-amopark-gray-light bg-gradient-to-b from-amopark-green/5 to-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">{inner}</div>
    </section>
  );
}
