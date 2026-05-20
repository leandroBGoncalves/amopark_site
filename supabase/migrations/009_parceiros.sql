-- Parceiros da comunidade: políticos, empresas, entidades e cidadãos apoiadores.

insert into storage.buckets (id, name, public)
values ('parceiros', 'parceiros', true)
on conflict (id) do nothing;

create policy "parceiros_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'parceiros');

create policy "parceiros_storage_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'parceiros'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "parceiros_storage_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'parceiros'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "parceiros_storage_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'parceiros'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  partner_type text not null check (
    partner_type in ('politico', 'empresa', 'entidade', 'cidadao')
  ),
  summary text not null default '',
  description text not null default '',
  logo_storage_path text,
  website_url text,
  sort_order int not null default 0,
  featured_home boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists parceiros_type_sort_idx on public.parceiros (partner_type, sort_order, name);
create index if not exists parceiros_published_idx on public.parceiros (published, featured_home)
  where published = true;

alter table public.parceiros enable row level security;

drop policy if exists "parceiros_select_public" on public.parceiros;
create policy "parceiros_select_public"
  on public.parceiros for select
  using (published = true);

drop policy if exists "parceiros_insert_admin" on public.parceiros;
create policy "parceiros_insert_admin"
  on public.parceiros for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "parceiros_update_admin" on public.parceiros;
create policy "parceiros_update_admin"
  on public.parceiros for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "parceiros_delete_admin" on public.parceiros;
create policy "parceiros_delete_admin"
  on public.parceiros for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
