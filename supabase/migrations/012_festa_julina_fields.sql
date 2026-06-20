-- Festa Julina: timeline de atualizações no evento e tier de parceiros.

alter table public.eventos
  add column if not exists updates jsonb not null default '[]';

alter table public.parceiros
  add column if not exists festa_julina_tier text
  check (festa_julina_tier is null or festa_julina_tier in ('patrocinador', 'apoiador'));

create index if not exists parceiros_festa_julina_tier_idx
  on public.parceiros (festa_julina_tier)
  where festa_julina_tier is not null;
