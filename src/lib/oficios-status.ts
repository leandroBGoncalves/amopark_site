export const OFICIO_STATUS_VALUES = [
  "enviado",
  "em_analise",
  "respondido",
  "nao_respondido",
  "atendido",
  "nao_atendido",
] as const;

export type OficioStatusValue = (typeof OFICIO_STATUS_VALUES)[number];

export function isOficioStatusValue(s: string): s is OficioStatusValue {
  return (OFICIO_STATUS_VALUES as readonly string[]).includes(s);
}

export function parseOficioStatus(raw: string | null | undefined): OficioStatusValue {
  if (raw && isOficioStatusValue(raw)) return raw;
  return "enviado";
}

export function oficioStatusLabel(s: OficioStatusValue | string): string {
  switch (s) {
    case "em_analise":
      return "Em análise";
    case "respondido":
      return "Respondido";
    case "nao_respondido":
      return "Não respondido";
    case "atendido":
      return "Atendido";
    case "nao_atendido":
      return "Não atendido";
    case "enviado":
    default:
      return "Enviado";
  }
}
