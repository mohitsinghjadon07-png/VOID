-- VOID Cloud Auth schema. Run this once in Supabase Dashboard > SQL Editor.
-- The profile table stores public account IDs but exposes no rows via the browser.
create table if not exists public.void_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists void_profiles_username_ci
  on public.void_profiles (lower(username));

alter table public.void_profiles enable row level security;

-- Create a profile whenever Supabase Auth creates an account, using user metadata.
create or replace function public.void_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_name text;
begin
  account_name := trim(coalesce(new.raw_user_meta_data ->> 'username', ''));
  if account_name = '' then
    raise exception 'VOID_USERNAME_REQUIRED';
  end if;
  insert into public.void_profiles (id, username)
  values (new.id, account_name);
  return new;
end;
$$;

drop trigger if exists void_on_auth_user_created on auth.users;
create trigger void_on_auth_user_created
after insert on auth.users
for each row execute procedure public.void_handle_new_user();

-- Only the Edge Function's service-role client may call this function. It returns
-- an email internally to the server-side login function and is never sent to the browser.
create or replace function public.void_email_for_username(input_username text)
returns text
language sql
security definer
set search_path = ''
as $$
  select u.email::text
  from auth.users as u
  join public.void_profiles as p on p.id = u.id
  where lower(p.username) = lower(trim(input_username))
    and u.deleted_at is null
  limit 1;
$$;

revoke all on table public.void_profiles from anon, authenticated;
revoke all on function public.void_email_for_username(text) from public, anon, authenticated;
grant execute on function public.void_email_for_username(text) to service_role;

notify pgrst, 'reload schema';
