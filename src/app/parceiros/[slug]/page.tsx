import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Handshake,
  Landmark,
  UserRound,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getPublishedParceiroBySlug } from "@/lib/parceiros-db";
import { parceiroBadgeLabel } from "@/lib/parceiros-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const typeIcons = {
  empresa: Building2,
  entidade: Handshake,
  politico: Landmark,
  cidadao: UserRound,
} as const;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getPublishedParceiroBySlug(params.slug).catch(() => null);
  if (!p) return { title: "Parceiro" };
  return { title: `${p.name} | Parceiros AMOPARK` };
}

export default async function ParceiroDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let parceiro: Awaited<ReturnType<typeof getPublishedParceiroBySlug>> = null;
  try {
    parceiro = await getPublishedParceiroBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!parceiro) notFound();

  const Icon = typeIcons[parceiro.partnerType];
  const typeLabel = parceiroBadgeLabel(parceiro.partnerType);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={ROUTES.parceiros}
        className="inline-flex items-center gap-2 text-sm font-medium text-amopark-blue hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos os parceiros
      </Link>

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amopark-gray-light bg-white shadow-sm">
          {parceiro.logoUrl ? (
            <Image
              src={parceiro.logoUrl}
              alt=""
              width={112}
              height={112}
              className="h-full w-full object-contain p-2"
              priority
            />
          ) : (
            <Icon className="h-12 w-12 text-amopark-charcoal/35" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-wide text-amopark-blue">
            {typeLabel}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-amopark-charcoal sm:text-4xl">
            {parceiro.name}
          </h1>
          {parceiro.summary && (
            <p className="mt-4 text-lg text-amopark-charcoal/85">{parceiro.summary}</p>
          )}
          {parceiro.websiteUrl && (
            <a
              href={parceiro.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amopark-blue/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Visitar site
            </a>
          )}
        </div>
      </header>

      {parceiro.description?.trim() && (
        <div className="prose prose-sm mt-10 max-w-none text-amopark-charcoal/90 sm:prose-base whitespace-pre-wrap">
          {parceiro.description}
        </div>
      )}
    </article>
  );
}
