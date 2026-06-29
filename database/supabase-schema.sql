-- Auth-based setup:
-- posts are publicly readable, but create/update/delete is limited to the user
-- who owns the row via author_id.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null,
  role text not null default 'author' check (role in ('author', 'admin')),
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_email text,
  author_display_name text,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  cover_image text,
  read_time integer not null default 5,
  status text not null default 'draft' check (status in ('draft', 'published')),
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists posts_search_idx
on public.posts
using gin (
  to_tsvector(
    'english',
    coalesce(title, '') || ' ' ||
    coalesce(excerpt, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(slug, '')
  )
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create or replace function public.search_posts(search_term text)
returns setof public.posts
language sql
stable
set search_path = public
as $$
  select posts.*
  from public.posts as posts
  where
    nullif(trim(search_term), '') is not null
    and to_tsvector(
      'english',
      coalesce(posts.title, '') || ' ' ||
      coalesce(posts.excerpt, '') || ' ' ||
      coalesce(posts.content, '') || ' ' ||
      coalesce(posts.category, '') || ' ' ||
      coalesce(posts.slug, '')
    ) @@ websearch_to_tsquery('english', trim(search_term))
  order by
    ts_rank(
      to_tsvector(
        'english',
        coalesce(posts.title, '') || ' ' ||
        coalesce(posts.excerpt, '') || ' ' ||
        coalesce(posts.content, '') || ' ' ||
        coalesce(posts.category, '') || ' ' ||
        coalesce(posts.slug, '')
      ),
      websearch_to_tsquery('english', trim(search_term))
    ) desc,
    posts.created_at desc;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_email text;
begin
  select email
  into auth_email
  from auth.users
  where id = new.id;

  new.email := auth_email;
  new.updated_at := now();

  return new;
end;
$$;

create or replace function public.sync_post_author_metadata()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_email text;
  profile_display_name text;
begin
  select email
  into auth_email
  from auth.users
  where id = new.author_id;

  select display_name
  into profile_display_name
  from public.profiles
  where id = new.author_id;

  new.author_email := auth_email;
  new.author_display_name := coalesce(
    nullif(profile_display_name, ''),
    nullif(split_part(auth_email, '@', 1), ''),
    'Author'
  );
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists profiles_sync_email on public.profiles;
create trigger profiles_sync_email
before insert or update on public.profiles
for each row
execute function public.sync_profile_email();

drop trigger if exists posts_sync_author_metadata on public.posts;
create trigger posts_sync_author_metadata
before insert or update on public.posts
for each row
execute function public.sync_post_author_metadata();

grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;
grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;

drop policy if exists "public can read profiles" on public.profiles;
create policy "public can read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can insert own profile" on public.profiles;
create policy "authenticated users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id and coalesce(role, 'author') = 'author');

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (
    select current_profile.role
    from public.profiles as current_profile
    where current_profile.id = auth.uid()
  )
);

drop policy if exists "public can read posts" on public.posts;
create policy "public can read posts"
on public.posts
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can insert own posts" on public.posts;
create policy "authenticated users can insert own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id or public.is_admin(auth.uid()))
with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "authors can delete own posts" on public.posts;
create policy "authors can delete own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id or public.is_admin(auth.uid()));

update public.profiles
set email = auth_users.email,
    updated_at = now()
from auth.users as auth_users
where auth_users.id = public.profiles.id;

update public.posts
set author_email = auth_users.email,
    author_display_name = coalesce(
      nullif(profiles.display_name, ''),
      nullif(split_part(auth_users.email, '@', 1), ''),
      'Author'
    ),
    updated_at = now()
from auth.users as auth_users
left join public.profiles as profiles on profiles.id = auth_users.id
where auth_users.id = public.posts.author_id;
