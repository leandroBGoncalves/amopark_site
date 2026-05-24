-- Mensagens do formulário de contato (site público → painel admin).

create table if not exists public.contato_mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  assunto text,
  mensagem text not null,
  status text not null default 'novo' check (status in ('novo', 'lido', 'arquivado')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists contato_mensagens_created_at_idx
  on public.contato_mensagens (created_at desc);

create index if not exists contato_mensagens_status_idx
  on public.contato_mensagens (status, created_at desc);

alter table public.contato_mensagens enable row level security;

-- Sem policies para anon/authenticated: leitura e escrita apenas via service role nas API routes.
