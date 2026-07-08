-- MR-006B Learning Journey Engine

create table if not exists public.learning_journeys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image text,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'custom')),
  estimated_days integer not null default 0 check (estimated_days >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_days (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.learning_journeys(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text not null,
  description text,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  reward_xp integer not null default 0 check (reward_xp >= 0),
  unlock_type text not null default 'sequential' check (
    unlock_type in ('sequential', 'date_based', 'manual', 'admin', 'conditional')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, day_number)
);

create table if not exists public.journey_tasks (
  id uuid primary key default gen_random_uuid(),
  journey_day_id uuid not null references public.journey_days(id) on delete cascade,
  task_type text not null check (
    task_type in (
      'lesson',
      'practice',
      'meditation',
      'journal',
      'wish_box',
      'vision_board',
      'affirmation',
      'challenge',
      'live_session'
    )
  ),
  title text not null,
  description text,
  course_id uuid references public.courses(id) on delete set null,
  module_id uuid references public.course_modules(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  practice_id uuid references public.daily_practices(id) on delete set null,
  meditation_id uuid references public.meditations(id) on delete set null,
  journal_prompt text,
  wish_box_required boolean not null default false,
  vision_board_required boolean not null default false,
  affirmation_required boolean not null default false,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_day_id, order_index)
);

create table if not exists public.user_journey_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_id uuid not null references public.learning_journeys(id) on delete cascade,
  current_day integer not null default 1 check (current_day > 0),
  current_task uuid references public.journey_tasks(id) on delete set null,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  total_practice_minutes integer not null default 0 check (total_practice_minutes >= 0),
  rewards_unlocked jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, journey_id)
);

create table if not exists public.user_day_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_day_id uuid not null references public.journey_days(id) on delete cascade,
  status text not null default 'locked' check (
    status in ('locked', 'available', 'in_progress', 'completed')
  ),
  started_at timestamptz,
  completed_at timestamptz,
  reward_claimed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, journey_day_id)
);

create table if not exists public.user_task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.journey_tasks(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  time_spent integer not null default 0 check (time_spent >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create table if not exists public.journey_rewards (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.learning_journeys(id) on delete cascade,
  reward_key text not null,
  title text not null,
  description text,
  reward_type text not null check (
    reward_type in ('badge', 'achievement', 'daily', 'completion')
  ),
  xp_threshold integer check (xp_threshold >= 0),
  day_number integer check (day_number > 0),
  created_at timestamptz not null default now(),
  unique (journey_id, reward_key)
);

create trigger learning_journeys_updated_at
before update on public.learning_journeys
for each row execute function public.update_updated_at();

create trigger journey_days_updated_at
before update on public.journey_days
for each row execute function public.update_updated_at();

create trigger journey_tasks_updated_at
before update on public.journey_tasks
for each row execute function public.update_updated_at();

create trigger user_journey_progress_updated_at
before update on public.user_journey_progress
for each row execute function public.update_updated_at();

create trigger user_day_progress_updated_at
before update on public.user_day_progress
for each row execute function public.update_updated_at();

create trigger user_task_progress_updated_at
before update on public.user_task_progress
for each row execute function public.update_updated_at();

alter table public.learning_journeys enable row level security;
alter table public.journey_days enable row level security;
alter table public.journey_tasks enable row level security;
alter table public.user_journey_progress enable row level security;
alter table public.user_day_progress enable row level security;
alter table public.user_task_progress enable row level security;
alter table public.journey_rewards enable row level security;

create policy "Journeys readable" on public.learning_journeys for select using (is_active or public.is_admin());
create policy "Admins manage journeys" on public.learning_journeys for all using (public.is_admin()) with check (public.is_admin());

create policy "Journey days readable" on public.journey_days for select using (
  exists (select 1 from public.learning_journeys j where j.id = journey_id and (j.is_active or public.is_admin()))
);
create policy "Admins manage journey days" on public.journey_days for all using (public.is_admin()) with check (public.is_admin());

create policy "Journey tasks readable" on public.journey_tasks for select using (
  exists (
    select 1
    from public.journey_days d
    join public.learning_journeys j on j.id = d.journey_id
    where d.id = journey_day_id and (j.is_active or public.is_admin())
  )
);
create policy "Admins manage journey tasks" on public.journey_tasks for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own journey progress" on public.user_journey_progress for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own day progress" on public.user_day_progress for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own task progress" on public.user_task_progress for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Journey rewards readable" on public.journey_rewards for select using (true);
create policy "Admins manage journey rewards" on public.journey_rewards for all using (public.is_admin()) with check (public.is_admin());

create index if not exists learning_journeys_slug_idx on public.learning_journeys(slug);
create index if not exists learning_journeys_active_idx on public.learning_journeys(is_active);
create index if not exists journey_days_journey_id_idx on public.journey_days(journey_id);
create index if not exists journey_days_day_number_idx on public.journey_days(journey_id, day_number);
create index if not exists journey_tasks_day_id_idx on public.journey_tasks(journey_day_id);
create index if not exists journey_tasks_type_idx on public.journey_tasks(task_type);
create index if not exists user_journey_progress_user_id_idx on public.user_journey_progress(user_id);
create index if not exists user_journey_progress_journey_id_idx on public.user_journey_progress(journey_id);
create index if not exists user_day_progress_user_id_idx on public.user_day_progress(user_id);
create index if not exists user_day_progress_status_idx on public.user_day_progress(user_id, status);
create index if not exists user_task_progress_user_id_idx on public.user_task_progress(user_id);
create index if not exists user_task_progress_task_id_idx on public.user_task_progress(task_id);
create index if not exists user_task_progress_completed_idx on public.user_task_progress(user_id, completed);
create index if not exists journey_rewards_journey_id_idx on public.journey_rewards(journey_id);
