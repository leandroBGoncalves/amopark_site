-- AMOPARK: perfis (admin) e ofícios + storage
-- Execute no SQL Editor do Supabase (ou via CLI).

-- Perfis ligados ao Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Ofícios (mural de transparência)
create table if not exists public.oficios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  summary text not null default '',
  numero_oficio text,
  destinatario text,
  storage_path text,
  drive_file_id text,
  web_view_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists oficios_created_at_idx on public.oficios (created_at desc);

alter table public.oficios enable row level security;

-- Leitura pública (site dos moradores)
create policy "oficios_select_public"
  on public.oficios for select
  using (true);

-- Escrita apenas para admins (JWT)
create policy "oficios_insert_admin"
  on public.oficios for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "oficios_update_admin"
  on public.oficios for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "oficios_delete_admin"
  on public.oficios for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Novo usuário: cria linha em profiles (papel user; promova a admin manualmente)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage: bucket público para download dos .docx pelo site
insert into storage.buckets (id, name, public)
values ('oficios', 'oficios', true)
on conflict (id) do nothing;

-- Leitura pública dos arquivos do bucket
create policy "oficios_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'oficios');

-- Upload/delete: apenas admins
create policy "oficios_storage_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'oficios'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "oficios_storage_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'oficios'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "oficios_storage_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'oficios'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
