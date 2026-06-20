export const FALE_CONOSCO_TIPOS = ["sugestao", "reclamacao", "duvida"] as const;

export type FaleConoscoTipo = (typeof FALE_CONOSCO_TIPOS)[number];

export const FALE_CONOSCO_TIPO_LABELS: Record<FaleConoscoTipo, string> = {
  sugestao: "Sugestão",
  reclamacao: "Reclamação",
  duvida: "Dúvida",
};

export const FALE_CONOSCO_STATUS_VALUES = [
  "novo",
  "em_analise",
  "respondido",
  "arquivado",
] as const;

export type FaleConoscoStatus = (typeof FALE_CONOSCO_STATUS_VALUES)[number];

export const FALE_CONOSCO_STATUS_LABELS: Record<FaleConoscoStatus, string> = {
  novo: "Nova",
  em_analise: "Em análise",
  respondido: "Respondida",
  arquivado: "Arquivada",
};

export interface FaleConoscoMensagemRow {
  id: string;
  protocolo: string;
  tipo: FaleConoscoTipo;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  status: FaleConoscoStatus;
  resposta: string | null;
  resposta_at: string | null;
  access_token: string | null;
  access_revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaleConoscoTrackingView {
  protocolo: string;
  tipo: FaleConoscoTipo;
  status: FaleConoscoStatus;
  assunto: string | null;
  mensagem: string;
  resposta: string | null;
  resposta_at: string | null;
  created_at: string;
  updated_at: string;
}

export type FaleConoscoTrackingLookup =
  | { kind: "active"; data: FaleConoscoTrackingView }
  | { kind: "revoked"; protocolo: string; revoked_at: string | null }
  | { kind: "not_found" };

export function isFaleConoscoTipo(value: string): value is FaleConoscoTipo {
  return (FALE_CONOSCO_TIPOS as readonly string[]).includes(value);
}

export function isFaleConoscoStatus(value: string): value is FaleConoscoStatus {
  return (FALE_CONOSCO_STATUS_VALUES as readonly string[]).includes(value);
}
