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
