create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'admin', 'super_admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  theme text not null default 'system',
  language text not null default 'en',
  notifications boolean not null default true,
  daily_reminder time,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  course_progress jsonb not null default '{}'::jsonb,
  meditation_minutes integer not null default 0,
  journal_entries integer not null default 0,
  streak integer not null default 0,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  marketing_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create trigger user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

create trigger notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_full_name text;
  user_avatar_url text;
begin
  user_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Student');
  user_avatar_url := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, user_full_name, user_avatar_url, 'student');

  insert into public.user_settings (user_id, timezone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'timezone', 'UTC'));

  insert into public.user_progress (user_id)
  values (new.id);

  insert into public.notification_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_progress enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can read all profiles"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "Super admins can manage profiles"
on public.profiles for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'super_admin'
  )
);

create policy "Users can manage their own settings"
on public.user_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own progress"
on public.user_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own notification preferences"
on public.notification_preferences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can read user settings"
on public.user_settings for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "Admins can read user progress"
on public.user_progress for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "Admins can read notification preferences"
on public.notification_preferences for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);
