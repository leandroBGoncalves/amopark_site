-- Conquistas exibidas na home (Últimas Conquistas) e em Notícias.
--
-- Se aparecer "column p.role does not exist", sua tabela public.profiles foi
-- criada sem a coluna role — o bloco abaixo adiciona antes das policies.

alter table public.profiles
  add column if not exists role text not null default 'user';

create table if not exists public.conquistas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  date_label text,
  color_index smallint not null default 0 check (color_index >= 0 and color_index <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists conquistas_created_at_idx on public.conquistas (created_at desc);

alter table public.conquistas enable row level security;

drop policy if exists "conquistas_select_public" on public.conquistas;
create policy "conquistas_select_public"
  on public.conquistas for select
  using (true);

drop policy if exists "conquistas_insert_admin" on public.conquistas;
create policy "conquistas_insert_admin"
  on public.conquistas for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "conquistas_update_admin" on public.conquistas;
create policy "conquistas_update_admin"
  on public.conquistas for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "conquistas_delete_admin" on public.conquistas;
create policy "conquistas_delete_admin"
  on public.conquistas for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
