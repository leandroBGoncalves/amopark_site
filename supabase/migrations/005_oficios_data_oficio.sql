-- Data de referência do ofício (ex.: data constante no documento). Opcional.
alter table public.oficios add column if not exists data_oficio date;

comment on column public.oficios.data_oficio is 'Data do ofício informada no painel; se null, usar created_at na exibição.';
