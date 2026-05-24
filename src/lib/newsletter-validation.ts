const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseNewsletterBody(
  body: Record<string, unknown>
): { ok: true; email: string; nome: string | null } | { ok: false; error: string } {
  const website = typeof body.website === "string" ? body.website : "";
  if (website.trim()) {
    return { ok: false, error: "Não foi possível concluir a inscrição." };
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const nomeRaw = typeof body.nome === "string" ? body.nome.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (email.length > 200) {
    return { ok: false, error: "E-mail muito longo." };
  }
  if (nomeRaw.length > 120) {
    return { ok: false, error: "Nome muito longo." };
  }

  return {
    ok: true,
    email,
    nome: nomeRaw || null,
  };
}
