-- Status do ofício: coluna + constraint (rode no SQL Editor se ainda não existir a coluna)
-- Se já existir constraint antiga, ela é substituída.

alter table public.oficios
  add column if not exists status text;

update public.oficios
set status = 'enviado'
where status is null or trim(status) = '';

alter table public.oficios
  alter column status set default 'enviado',
  alter column status set not null;

alter table public.oficios drop constraint if exists oficios_status_check;

alter table public.oficios
  add constraint oficios_status_check check (
    status in (
      'enviado',
      'em_analise',
      'respondido',
      'atendido',
      'nao_atendido',
      'nao_respondido'
    )
  );

comment on column public.oficios.status is
  'enviado | em_analise | respondido | atendido | nao_atendido | nao_respondido';
