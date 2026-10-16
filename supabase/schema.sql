-- Run once in the SQL Editor of a NEW, dedicated Supabase project.
-- No owner is created automatically. Access stays closed until set-owner.sql is run.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.portfolio_owner (
  id boolean primary key default true check (id),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
revoke all on private.portfolio_owner from public, anon, authenticated;
alter table private.portfolio_owner enable row level security;

create function public.is_portfolio_owner()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.portfolio_owner where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_portfolio_owner() from public, anon;
grant execute on function public.is_portfolio_owner() to authenticated;

-- This document contains ONLY information intended for the public portfolio.
create table public.portfolio_content (
  id boolean primary key default true check (id),
  data jsonb not null check (
    jsonb_typeof(data) = 'object'
    and data ?& array['profile','projects','skills','experience','education','certifications','gallery','cv']
    and jsonb_typeof(data->'profile') = 'object'
    and jsonb_typeof(data->'cv') = 'object'
    and jsonb_typeof(data->'projects') = 'array'
    and jsonb_typeof(data->'skills') = 'array'
    and jsonb_typeof(data->'experience') = 'array'
    and jsonb_typeof(data->'education') = 'array'
    and jsonb_typeof(data->'certifications') = 'array'
    and jsonb_typeof(data->'gallery') = 'array'
    and octet_length(data::text) <= 2097152
  ),
  version integer not null default 1 check (version > 0)
);
alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from public, anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant insert, update, delete on public.portfolio_content to authenticated;
create policy "Public can read published portfolio" on public.portfolio_content
  for select to anon, authenticated using (true);
create policy "Only owner can insert portfolio" on public.portfolio_content
  for insert to authenticated with check ((select public.is_portfolio_owner()));
create policy "Only owner can update portfolio" on public.portfolio_content
  for update to authenticated using ((select public.is_portfolio_owner()))
  with check ((select public.is_portfolio_owner()));
create policy "Only owner can delete portfolio" on public.portfolio_content
  for delete to authenticated using ((select public.is_portfolio_owner()));

-- Version check prevents overwriting changes published in another tab.
-- SECURITY INVOKER keeps database RLS active inside this function.
create function public.save_portfolio(document jsonb, expected_version integer)
returns setof public.portfolio_content
language plpgsql security invoker
set search_path = ''
as $$
begin
  if not public.is_portfolio_owner() then
    raise exception 'Owner access required' using errcode = '42501';
  end if;
  if expected_version = 0 then
    return query insert into public.portfolio_content (id, data, version)
      values (true, document, 1) on conflict (id) do nothing
      returning *;
  else
    return query update public.portfolio_content as p
      set data = document, version = p.version + 1
      where p.id = true and p.version = expected_version
      returning p.*;
  end if;
end;
$$;
revoke all on function public.save_portfolio(jsonb, integer) from public, anon;
grant execute on function public.save_portfolio(jsonb, integer) to authenticated;

-- Public delivery is intentional; only the owner can upload/list/delete assets.
-- Original filenames are replaced with random UUIDs by the application.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-public', 'portfolio-public', true, 10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']);
create policy "Owner can list portfolio uploads" on storage.objects
  for select to authenticated
  using (bucket_id = 'portfolio-public' and (select public.is_portfolio_owner()));
create policy "Owner can upload portfolio files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio-public'
    and (select public.is_portfolio_owner())
    and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$'
  );
create policy "Owner can delete unused portfolio files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'portfolio-public'
    and (select public.is_portfolio_owner())
    and not exists (
      select 1 from public.portfolio_content p
      where p.data::text like '%' || storage.objects.name || '%'
    )
  );
-- No update policy: existing public files cannot be silently overwritten.
commit;
