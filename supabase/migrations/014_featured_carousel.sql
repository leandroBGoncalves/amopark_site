-- Controle do carrossel da home: só itens marcados aparecem no hero.

alter table public.eventos
  add column if not exists featured_carousel boolean not null default false;

alter table public.parceiros
  add column if not exists featured_carousel boolean not null default false;

alter table public.conquistas
  add column if not exists featured_carousel boolean not null default false;

create index if not exists eventos_carousel_idx
  on public.eventos (featured_carousel, event_date desc)
  where featured_carousel = true and published = true;

create index if not exists parceiros_carousel_idx
  on public.parceiros (featured_carousel, sort_order)
  where featured_carousel = true and published = true;

create index if not exists conquistas_carousel_idx
  on public.conquistas (featured_carousel, created_at desc)
  where featured_carousel = true;
