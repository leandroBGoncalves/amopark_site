-- Eventos do bairro: página pública, galeria (fotos no Storage, vídeo por URL).

alter table public.profiles
  add column if not exists role text not null default 'user';

insert into storage.buckets (id, name, public)
values ('eventos', 'eventos', true)
on conflict (id) do nothing;

create policy "eventos_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'eventos');

create policy "eventos_storage_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'eventos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "eventos_storage_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'eventos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "eventos_storage_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'eventos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  event_date date not null,
  time_note text,
  edition_label text,
  featured_home boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists eventos_event_date_idx on public.eventos (event_date desc);
create index if not exists eventos_upcoming_idx on public.eventos (event_date asc)
  where published = true;

create table if not exists public.evento_midias (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  sort_order int not null default 0,
  kind text not null check (kind in ('image', 'video_embed')),
  storage_path text,
  embed_url text,
  caption text,
  created_at timestamptz not null default now(),
  constraint evento_midias_payload_chk check (
    (kind = 'image' and storage_path is not null and length(trim(storage_path)) > 0)
    or
    (kind = 'video_embed' and embed_url is not null and length(trim(embed_url)) > 0)
  )
);

create index if not exists evento_midias_evento_idx on public.evento_midias (evento_id, sort_order);

alter table public.eventos enable row level security;
alter table public.evento_midias enable row level security;

drop policy if exists "eventos_select_public" on public.eventos;
create policy "eventos_select_public"
  on public.eventos for select
  using (published = true);

drop policy if exists "evento_midias_select_public" on public.evento_midias;
create policy "evento_midias_select_public"
  on public.evento_midias for select
  using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.published = true
    )
  );

drop policy if exists "eventos_insert_admin" on public.eventos;
create policy "eventos_insert_admin"
  on public.eventos for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "eventos_update_admin" on public.eventos;
create policy "eventos_update_admin"
  on public.eventos for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "eventos_delete_admin" on public.eventos;
create policy "eventos_delete_admin"
  on public.eventos for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "evento_midias_insert_admin" on public.evento_midias;
create policy "evento_midias_insert_admin"
  on public.evento_midias for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "evento_midias_update_admin" on public.evento_midias;
create policy "evento_midias_update_admin"
  on public.evento_midias for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "evento_midias_delete_admin" on public.evento_midias;
create policy "evento_midias_delete_admin"
  on public.evento_midias for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
