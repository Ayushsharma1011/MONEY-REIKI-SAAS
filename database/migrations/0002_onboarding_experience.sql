alter table public.profiles
add column if not exists experience_level text,
add column if not exists bio text,
add column if not exists onboarding_completed boolean not null default false,
add column if not exists primary_goal text[] not null default '{}';

alter table public.user_settings
add column if not exists practice_minutes integer not null default 10,
add column if not exists preferred_language text not null default 'english',
add column if not exists daily_reminder_time time;

alter table public.user_progress
add column if not exists default_daily_practice jsonb not null default '{}'::jsonb,
add column if not exists dashboard_state jsonb not null default '{}'::jsonb,
add column if not exists ai_journey_placeholder jsonb not null default '{}'::jsonb;

alter table public.notification_preferences
add column if not exists daily_reminder_enabled boolean not null default true;

alter table public.profiles
add constraint profiles_experience_level_check
check (experience_level is null or experience_level in ('beginner', 'intermediate', 'advanced'));

alter table public.user_settings
add constraint user_settings_practice_minutes_check
check (practice_minutes in (5, 10, 15, 20, 30, 45, 60));
