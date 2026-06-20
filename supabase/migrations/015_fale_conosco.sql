-- Sugestões, reclamações e dúvidas (ouvidoria) com protocolo e resposta da diretoria.

create table if not exists public.fale_conosco_mensagens (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique,
  tipo text not null check (tipo in ('sugestao', 'reclamacao', 'duvida')),
  nome text not null,
  email text not null,
  telefone text,
  assunto text,
  mensagem text not null,
  status text not null default 'novo'
    check (status in ('novo', 'em_analise', 'respondido', 'arquivado')),
  resposta text,
  resposta_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fale_conosco_created_at_idx
  on public.fale_conosco_mensagens (created_at desc);

create index if not exists fale_conosco_status_idx
  on public.fale_conosco_mensagens (status, created_at desc);

create index if not exists fale_conosco_protocolo_idx
  on public.fale_conosco_mensagens (protocolo);

alter table public.fale_conosco_mensagens enable row level security;
