-- Inscrições na newsletter (CTA da home e futuros formulários).

create table if not exists public.newsletter_inscricoes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nome text,
  origem text not null default 'home',
  created_at timestamptz not null default now(),
  constraint newsletter_inscricoes_email_unique unique (email)
);

create index if not exists newsletter_inscricoes_created_at_idx
  on public.newsletter_inscricoes (created_at desc);

alter table public.newsletter_inscricoes enable row level security;

-- Sem policies: acesso apenas via service role nas API routes.
