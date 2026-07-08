create extension if not exists "pgcrypto";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  cover_image text,
  level text not null default 'beginner',
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (course_id, order_index)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  video_url text,
  thumbnail text,
  duration integer not null default 0 check (duration >= 0),
  lesson_type text not null default 'video',
  order_index integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (module_id, slug),
  unique (module_id, order_index)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  watch_time integer not null default 0 check (watch_time >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  mood text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.wish_box_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  status text not null default 'active',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.vision_board_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  image_url text not null,
  notes text,
  position jsonb not null default '{"x":0,"y":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.meditations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  audio_url text not null,
  thumbnail text,
  duration integer not null default 0 check (duration >= 0),
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.daily_practices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  estimated_minutes integer not null default 5 check (estimated_minutes > 0),
  difficulty text not null default 'beginner',
  practice_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.user_daily_practice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  practice_id uuid not null references public.daily_practices(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, practice_id, created_at)
);

create table if not exists public.affirmations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  language text not null default 'english',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_days integer not null check (duration_days > 0),
  difficulty text not null default 'beginner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_day integer not null default 1 check (current_day > 0),
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (challenge_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  widget_key text not null unique,
  title text not null,
  enabled boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.update_updated_at()
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

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.calculate_user_streak(target_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(max(streak), 0)
  from public.user_progress
  where user_id = target_user_id;
$$;

create or replace function public.complete_lesson(target_lesson_id uuid, watched_seconds integer default 0)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lesson_progress (user_id, lesson_id, completed, watch_time, completed_at)
  values (auth.uid(), target_lesson_id, true, greatest(watched_seconds, 0), now())
  on conflict (user_id, lesson_id)
  do update set completed = true, watch_time = greatest(excluded.watch_time, public.lesson_progress.watch_time), completed_at = now(), updated_at = now();
end;
$$;

create or replace function public.complete_practice(target_practice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_daily_practice (user_id, practice_id, completed, completed_at)
  values (auth.uid(), target_practice_id, true, now());
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
  set read = true
  where id = target_notification_id
  and user_id = auth.uid();
$$;

create trigger courses_updated_at before update on public.courses for each row execute function public.update_updated_at();
create trigger course_modules_updated_at before update on public.course_modules for each row execute function public.update_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function public.update_updated_at();
create trigger lesson_progress_updated_at before update on public.lesson_progress for each row execute function public.update_updated_at();
create trigger journal_entries_updated_at before update on public.journal_entries for each row execute function public.update_updated_at();
create trigger wish_box_items_updated_at before update on public.wish_box_items for each row execute function public.update_updated_at();
create trigger vision_board_items_updated_at before update on public.vision_board_items for each row execute function public.update_updated_at();
create trigger meditations_updated_at before update on public.meditations for each row execute function public.update_updated_at();
create trigger daily_practices_updated_at before update on public.daily_practices for each row execute function public.update_updated_at();
create trigger challenges_updated_at before update on public.challenges for each row execute function public.update_updated_at();

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.journal_entries enable row level security;
alter table public.gratitude_entries enable row level security;
alter table public.wish_box_items enable row level security;
alter table public.vision_board_items enable row level security;
alter table public.meditations enable row level security;
alter table public.daily_practices enable row level security;
alter table public.user_daily_practice enable row level security;
alter table public.affirmations enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.dashboard_widgets enable row level security;
alter table public.analytics_events enable row level security;

create policy "Published courses are readable" on public.courses for select using (deleted_at is null and (is_published or public.is_admin()));
create policy "Admins manage courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "Published modules are readable" on public.course_modules for select using (deleted_at is null and exists (select 1 from public.courses where id = course_id and deleted_at is null and (is_published or public.is_admin())));
create policy "Admins manage modules" on public.course_modules for all using (public.is_admin()) with check (public.is_admin());
create policy "Published lessons are readable" on public.lessons for select using (deleted_at is null and exists (select 1 from public.course_modules m join public.courses c on c.id = m.course_id where m.id = module_id and c.deleted_at is null and (c.is_published or public.is_admin())));
create policy "Admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own lesson progress" on public.lesson_progress for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own journal" on public.journal_entries for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own gratitude" on public.gratitude_entries for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own wishes" on public.wish_box_items for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own vision board" on public.vision_board_items for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own practice progress" on public.user_daily_practice for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own challenges" on public.challenge_progress for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users manage own notifications" on public.notifications for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "Users create own analytics events" on public.analytics_events for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admins read analytics events" on public.analytics_events for select using (public.is_admin());

create policy "Content library readable" on public.meditations for select using (deleted_at is null);
create policy "Admins manage meditations" on public.meditations for all using (public.is_admin()) with check (public.is_admin());
create policy "Practice library readable" on public.daily_practices for select using (deleted_at is null);
create policy "Admins manage practices" on public.daily_practices for all using (public.is_admin()) with check (public.is_admin());
create policy "Affirmations readable" on public.affirmations for select using (deleted_at is null);
create policy "Admins manage affirmations" on public.affirmations for all using (public.is_admin()) with check (public.is_admin());
create policy "Challenges readable" on public.challenges for select using (deleted_at is null);
create policy "Admins manage challenges" on public.challenges for all using (public.is_admin()) with check (public.is_admin());
create policy "Dashboard widgets readable" on public.dashboard_widgets for select using (enabled or public.is_admin());
create policy "Admins manage widgets" on public.dashboard_widgets for all using (public.is_admin()) with check (public.is_admin());

create index if not exists courses_slug_idx on public.courses(slug);
create index if not exists courses_created_by_idx on public.courses(created_by);
create index if not exists courses_search_idx on public.courses using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
create index if not exists course_modules_course_id_idx on public.course_modules(course_id);
create index if not exists lessons_module_id_idx on public.lessons(module_id);
create index if not exists lessons_slug_idx on public.lessons(slug);
create index if not exists lesson_progress_user_id_idx on public.lesson_progress(user_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress(lesson_id);
create index if not exists journal_entries_user_id_created_at_idx on public.journal_entries(user_id, created_at desc);
create index if not exists journal_entries_search_idx on public.journal_entries using gin(to_tsvector('english', title || ' ' || content));
create index if not exists gratitude_entries_user_id_created_at_idx on public.gratitude_entries(user_id, created_at desc);
create index if not exists wish_box_items_user_id_idx on public.wish_box_items(user_id);
create index if not exists vision_board_items_user_id_idx on public.vision_board_items(user_id);
create index if not exists meditations_category_idx on public.meditations(category);
create index if not exists daily_practices_type_idx on public.daily_practices(practice_type);
create index if not exists user_daily_practice_user_id_idx on public.user_daily_practice(user_id);
create index if not exists user_daily_practice_practice_id_idx on public.user_daily_practice(practice_id);
create index if not exists affirmations_category_language_idx on public.affirmations(category, language);
create index if not exists challenges_created_at_idx on public.challenges(created_at desc);
create index if not exists challenge_progress_challenge_id_idx on public.challenge_progress(challenge_id);
create index if not exists challenge_progress_user_id_idx on public.challenge_progress(user_id);
create index if not exists notifications_user_id_read_idx on public.notifications(user_id, read);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('lesson-assets', 'lesson-assets', false),
  ('journal-images', 'journal-images', false),
  ('vision-board', 'vision-board', false),
  ('wish-box', 'wish-box', false),
  ('certificates', 'certificates', false)
on conflict (id) do nothing;
