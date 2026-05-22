export const PARCEIRO_TYPES = [
  "empresa",
  "entidade",
  "politico",
  "cidadao",
] as const;

export type ParceiroType = (typeof PARCEIRO_TYPES)[number];

export const PARCEIRO_TYPE_LABELS: Record<ParceiroType, string> = {
  empresa: "Empresa / Empresário",
  entidade: "Entidade / Organização",
  politico: "Político / Instituição pública",
  cidadao: "Cidadão apoiador",
};

export const PARCEIRO_TYPE_ORDER: ParceiroType[] = [
  "empresa",
  "entidade",
  "politico",
  "cidadao",
];

/** Badge no carrossel, cards e perfil — linguagem do bairro, não a categoria do admin. */
export function parceiroBadgeLabel(type: ParceiroType): string {
  if (type === "politico") return "Parceiro da comunidade";
  return PARCEIRO_TYPE_LABELS[type];
}

export interface ParceiroRecord {
  id: string;
  name: string;
  slug: string;
  partnerType: ParceiroType;
  summary: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  sortOrder: number;
  featuredHome: boolean;
  published: boolean;
}
