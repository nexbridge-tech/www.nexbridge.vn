-- NexBridge Member Library MVP
-- Run this migration in the Supabase SQL editor before enabling member access.

create extension if not exists pgcrypto;

create type public.document_access_level as enum ('public', 'free_member', 'paid');
create type public.document_status as enum ('draft', 'published', 'archived');
create type public.entitlement_status as enum ('active', 'revoked', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  topic text,
  version text not null default '1.0',
  access_level public.document_access_level not null default 'free_member',
  status public.document_status not null default 'draft',
  storage_path text not null unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  source text not null default 'manual',
  status public.entitlement_status not null default 'active',
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, document_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  provider text,
  provider_reference text unique,
  currency text not null default 'VND',
  amount integer not null check (amount >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.download_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.entitlements enable row level security;
alter table public.orders enable row level security;
alter table public.download_logs enable row level security;

create policy "Members can view their profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Members can update their profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Members can view their entitlements" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members can view their orders" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'company');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_member();

create or replace function public.my_library()
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  topic text,
  version text,
  access_level public.document_access_level
)
language sql
stable
security definer set search_path = ''
as $$
  select d.id, d.slug, d.title, d.summary, d.topic, d.version, d.access_level
  from public.documents d
  where d.status = 'published'
    and (
      d.access_level = 'free_member'
      or exists (
        select 1 from public.entitlements e
        where e.document_id = d.id
          and e.user_id = (select auth.uid())
          and e.status = 'active'
          and (e.expires_at is null or e.expires_at > now())
      )
    )
  order by d.published_at desc nulls last, d.created_at desc;
$$;

revoke all on function public.my_library() from public;
grant execute on function public.my_library() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-documents', 'member-documents', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false;

grant select, update on public.profiles to authenticated;
grant select on public.entitlements, public.orders to authenticated;
grant all on public.profiles, public.documents, public.entitlements, public.orders, public.download_logs to service_role;
revoke all on public.documents from anon, authenticated;
