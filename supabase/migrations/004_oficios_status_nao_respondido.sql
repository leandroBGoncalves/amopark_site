-- Se a tabela já existia com a constraint antiga, rode este script no SQL Editor.
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
