const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContatoFormInput {
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  /** Honeypot — deve ficar vazio. */
  website: string;
}

export function parseContatoFormBody(
  body: Record<string, unknown>
): { ok: true; data: ContatoFormInput } | { ok: false; error: string } {
  const website = typeof body.website === "string" ? body.website : "";
  if (website.trim()) {
    return { ok: false, error: "Não foi possível enviar a mensagem." };
  }

  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const telefoneRaw = typeof body.telefone === "string" ? body.telefone.trim() : "";
  const assuntoRaw = typeof body.assunto === "string" ? body.assunto.trim() : "";
  const mensagem = typeof body.mensagem === "string" ? body.mensagem.trim() : "";

  if (nome.length < 2) {
    return { ok: false, error: "Informe seu nome (mínimo 2 caracteres)." };
  }
  if (nome.length > 120) {
    return { ok: false, error: "Nome muito longo." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (email.length > 200) {
    return { ok: false, error: "E-mail muito longo." };
  }
  if (telefoneRaw.length > 30) {
    return { ok: false, error: "Telefone muito longo." };
  }
  if (assuntoRaw.length > 200) {
    return { ok: false, error: "Assunto muito longo." };
  }
  if (mensagem.length < 10) {
    return { ok: false, error: "Escreva sua mensagem (mínimo 10 caracteres)." };
  }
  if (mensagem.length > 5000) {
    return { ok: false, error: "Mensagem muito longa (máximo 5000 caracteres)." };
  }

  return {
    ok: true,
    data: {
      nome,
      email,
      telefone: telefoneRaw || null,
      assunto: assuntoRaw || null,
      mensagem,
      website,
    },
  };
}
