-- Personal Explorer CMS — Phase 1
-- Before running this migration, replace the email near the bottom of this file.

create extension if not exists pgcrypto;

create table if not exists public.allowed_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.site_drafts (
  id text primary key,
  content jsonb not null,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.site_publications (
  id text primary key,
  content jsonb not null,
  revision integer not null default 1,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id)
);

create table if not exists public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  content jsonb not null,
  revision integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

-- RLS decides which rows are visible; these grants allow the API roles to
-- reach the tables before the policies are evaluated.
grant select on public.site_publications to anon, authenticated;
grant select, insert, update on public.site_drafts to authenticated;
grant select on public.site_versions to authenticated;

alter table public.allowed_admins enable row level security;
alter table public.site_drafts enable row level security;
alter table public.site_publications enable row level security;
alter table public.site_versions enable row level security;

drop policy if exists "admins read drafts" on public.site_drafts;
create policy "admins read drafts" on public.site_drafts for select to authenticated using (public.is_site_admin());
drop policy if exists "admins create drafts" on public.site_drafts;
create policy "admins create drafts" on public.site_drafts for insert to authenticated with check (public.is_site_admin());
drop policy if exists "admins update drafts" on public.site_drafts;
create policy "admins update drafts" on public.site_drafts for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "anyone reads publications" on public.site_publications;
create policy "anyone reads publications" on public.site_publications for select to anon, authenticated using (true);

drop policy if exists "admins read versions" on public.site_versions;
create policy "admins read versions" on public.site_versions for select to authenticated using (public.is_site_admin());

-- EDIT THIS before running the migration.
insert into public.allowed_admins(email)
values ('you@example.com')
on conflict (email) do nothing;
