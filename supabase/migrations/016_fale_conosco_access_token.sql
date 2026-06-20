-- Link temporário de acompanhamento para o morador (revogado ao arquivar).

alter table public.fale_conosco_mensagens
  add column if not exists access_token text unique,
  add column if not exists access_revoked_at timestamptz;

create unique index if not exists fale_conosco_access_token_idx
  on public.fale_conosco_mensagens (access_token)
  where access_token is not null;
