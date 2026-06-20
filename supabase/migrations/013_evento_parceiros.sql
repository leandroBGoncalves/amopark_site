-- Festa Julina: evento marcado como landing + vínculo patrocinador/apoiador por evento.

alter table public.eventos
  add column if not exists festa_julina_landing boolean not null default false;

create index if not exists eventos_festa_julina_landing_idx
  on public.eventos (festa_julina_landing)
  where festa_julina_landing = true and published = true;

create table if not exists public.evento_parceiros (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  parceiro_id uuid not null references public.parceiros (id) on delete cascade,
  role text not null check (role in ('patrocinador', 'apoiador')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (evento_id, parceiro_id)
);

create index if not exists evento_parceiros_evento_idx
  on public.evento_parceiros (evento_id, role, sort_order);

alter table public.evento_parceiros enable row level security;

drop policy if exists "evento_parceiros_select_public" on public.evento_parceiros;
create policy "evento_parceiros_select_public"
  on public.evento_parceiros for select
  using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.published = true
    )
  );

drop policy if exists "evento_parceiros_insert_admin" on public.evento_parceiros;
create policy "evento_parceiros_insert_admin"
  on public.evento_parceiros for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "evento_parceiros_update_admin" on public.evento_parceiros;
create policy "evento_parceiros_update_admin"
  on public.evento_parceiros for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "evento_parceiros_delete_admin" on public.evento_parceiros;
create policy "evento_parceiros_delete_admin"
  on public.evento_parceiros for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
