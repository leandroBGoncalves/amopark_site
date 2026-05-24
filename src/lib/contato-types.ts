export const CONTATO_STATUS_VALUES = ["novo", "lido", "arquivado"] as const;

export type ContatoStatus = (typeof CONTATO_STATUS_VALUES)[number];

export const CONTATO_STATUS_LABELS: Record<ContatoStatus, string> = {
  novo: "Nova",
  lido: "Lida",
  arquivado: "Arquivada",
};

export interface ContatoMensagemRow {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  status: ContatoStatus;
  created_at: string;
  read_at: string | null;
}

export function isContatoStatus(value: string): value is ContatoStatus {
  return (CONTATO_STATUS_VALUES as readonly string[]).includes(value);
}
