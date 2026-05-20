-- Capa do evento: referência opcional a uma foto da galeria.

alter table public.eventos
  add column if not exists cover_media_id uuid references public.evento_midias (id) on delete set null;

create index if not exists eventos_cover_media_idx on public.eventos (cover_media_id)
  where cover_media_id is not null;
