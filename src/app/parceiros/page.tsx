import Link from "next/link";
import { Handshake } from "lucide-react";
import { ParceiroCard } from "@/components/ParceiroCard";
import { ROUTES } from "@/lib/constants";
import { listPublishedParceiros } from "@/lib/parceiros-db";
import {
  PARCEIRO_TYPE_LABELS,
  PARCEIRO_TYPE_ORDER,
  type ParceiroRecord,
  type ParceiroType,
} from "@/lib/parceiros-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Parceiros da comunidade",
  description:
    "Políticos, empresas, entidades e cidadãos que apoiam de forma relevante o North Park e a AMOPARK.",
};

function groupByType(parceiros: ParceiroRecord[]): Map<ParceiroType, ParceiroRecord[]> {
  const map = new Map<ParceiroType, ParceiroRecord[]>();
  for (const t of PARCEIRO_TYPE_ORDER) {
    map.set(t, []);
  }
  for (const p of parceiros) {
    const list = map.get(p.partnerType) ?? [];
    list.push(p);
    map.set(p.partnerType, list);
  }
  return map;
}

export default async function ParceirosPage() {
  let all: ParceiroRecord[] = [];
  try {
    all = await listPublishedParceiros();
  } catch {
    all = [];
  }

  const grouped = groupByType(all);
  const hasAny = all.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <Handshake className="h-8 w-8 shrink-0 text-amopark-green" />
        Parceiros da comunidade
      </h1>
      <p className="mt-3 max-w-3xl text-amopark-charcoal/85">
        Reconhecemos quem apoia o North Park de forma relevante — políticos e
        instituições públicas, empresas e empresários, entidades do bairro e
        cidadãos que contribuem com a vida comunitária.
      </p>

      {!hasAny ? (
        <p className="mt-10 rounded-xl border border-dashed border-amopark-gray-light bg-amopark-gray-light/20 px-6 py-8 text-center text-sm text-amopark-charcoal/70">
          Em breve publicaremos nossos parceiros. A diretoria cadastra pelo{" "}
          <Link href={ROUTES.admin} className="font-medium text-amopark-blue hover:underline">
            painel administrativo
          </Link>{" "}
          (aba <strong>Parceiros</strong>).
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {PARCEIRO_TYPE_ORDER.map((type) => {
            const list = grouped.get(type) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="text-xl font-bold text-amopark-charcoal">
                  {PARCEIRO_TYPE_LABELS[type]}
                </h2>
                <p className="mt-1 text-sm text-amopark-charcoal/65">
                  {list.length} parceiro{list.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {list.map((p) => (
                    <ParceiroCard key={p.id} parceiro={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
