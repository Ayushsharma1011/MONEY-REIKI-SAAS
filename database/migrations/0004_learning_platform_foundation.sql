-- MR-006A Learning Platform Foundation

create table if not exists public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  description text,
  color text,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_category_courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.course_categories(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (category_id, course_id)
);

create table if not exists public.course_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.course_tag_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  tag_id uuid not null references public.course_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, tag_id)
);

create table if not exists public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_name text not null,
  instructor_bio text,
  instructor_avatar_url text,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_prerequisites (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  prerequisite_course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, prerequisite_course_id),
  check (course_id <> prerequisite_course_id)
);

create table if not exists public.course_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.recently_viewed_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  last_lesson_id uuid references public.lessons(id) on delete set null,
  viewed_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.course_reviews_placeholder (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  timestamp_seconds integer not null default 0 check (timestamp_seconds >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_resume (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  duration_watched integer not null default 0 check (duration_watched >= 0),
  completed boolean not null default false,
  playback_speed numeric(3, 2) not null default 1.0 check (playback_speed > 0),
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  resource_type text not null check (resource_type in ('pdf', 'zip', 'image', 'link', 'external')),
  url text,
  file_path text,
  mime_type text,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  resource_id uuid references public.lesson_resources(id) on delete set null,
  file_type text not null,
  downloaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  level text not null check (level in ('beginner', 'intermediate', 'advanced', 'custom')),
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.learning_path_courses (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  unique (learning_path_id, course_id),
  unique (learning_path_id, order_index)
);

create table if not exists public.user_learning_path (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  current_course_id uuid references public.courses(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, learning_path_id)
);

create table if not exists public.lesson_video_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  provider text not null check (provider in ('mux', 'cloudflare_stream', 'vimeo', 'bunny', 'supabase_storage', 's3')),
  provider_asset_id text not null,
  playback_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, provider)
);

create trigger course_categories_updated_at
before update on public.course_categories
for each row execute function public.update_updated_at();

create trigger course_instructors_updated_at
before update on public.course_instructors
for each row execute function public.update_updated_at();

create trigger course_reviews_placeholder_updated_at
before update on public.course_reviews_placeholder
for each row execute function public.update_updated_at();

create trigger lesson_notes_updated_at
before update on public.lesson_notes
for each row execute function public.update_updated_at();

create trigger lesson_bookmarks_updated_at
before update on public.lesson_bookmarks
for each row execute function public.update_updated_at();

create trigger lesson_resume_updated_at
before update on public.lesson_resume
for each row execute function public.update_updated_at();

create trigger lesson_resources_updated_at
before update on public.lesson_resources
for each row execute function public.update_updated_at();

create trigger learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.update_updated_at();

create trigger user_learning_path_updated_at
before update on public.user_learning_path
for each row execute function public.update_updated_at();

create trigger lesson_video_assets_updated_at
before update on public.lesson_video_assets
for each row execute function public.update_updated_at();

alter table public.course_categories enable row level security;
alter table public.course_category_courses enable row level security;
alter table public.course_tags enable row level security;
alter table public.course_tag_assignments enable row level security;
alter table public.course_instructors enable row level security;
alter table public.course_prerequisites enable row level security;
alter table public.course_favorites enable row level security;
alter table public.recently_viewed_courses enable row level security;
alter table public.course_reviews_placeholder enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.lesson_bookmarks enable row level security;
alter table public.lesson_resume enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.lesson_downloads enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_courses enable row level security;
alter table public.user_learning_path enable row level security;
alter table public.lesson_video_assets enable row level security;

create policy "Categories readable" on public.course_categories for select using (true);
create policy "Admins manage categories" on public.course_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Category courses readable" on public.course_category_courses for select using (true);
create policy "Admins manage category courses" on public.course_category_courses for all using (public.is_admin()) with check (public.is_admin());

create policy "Tags readable" on public.course_tags for select using (true);
create policy "Admins manage tags" on public.course_tags for all using (public.is_admin()) with check (public.is_admin());

create policy "Tag assignments readable" on public.course_tag_assignments for select using (true);
create policy "Admins manage tag assignments" on public.course_tag_assignments for all using (public.is_admin()) with check (public.is_admin());

create policy "Instructors readable" on public.course_instructors for select using (true);
create policy "Admins manage instructors" on public.course_instructors for all using (public.is_admin()) with check (public.is_admin());

create policy "Prerequisites readable" on public.course_prerequisites for select using (true);
create policy "Admins manage prerequisites" on public.course_prerequisites for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own favorites" on public.course_favorites for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own recently viewed" on public.recently_viewed_courses for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own review placeholders" on public.course_reviews_placeholder for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own lesson notes" on public.lesson_notes for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own bookmarks" on public.lesson_bookmarks for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Users manage own lesson resume" on public.lesson_resume for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Lesson resources readable" on public.lesson_resources for select using (true);
create policy "Admins manage lesson resources" on public.lesson_resources for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own downloads" on public.lesson_downloads for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Learning paths readable" on public.learning_paths for select using (deleted_at is null);
create policy "Admins manage learning paths" on public.learning_paths for all using (public.is_admin()) with check (public.is_admin());

create policy "Learning path courses readable" on public.learning_path_courses for select using (true);
create policy "Admins manage learning path courses" on public.learning_path_courses for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own learning paths" on public.user_learning_path for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "Video assets readable" on public.lesson_video_assets for select using (true);
create policy "Admins manage video assets" on public.lesson_video_assets for all using (public.is_admin()) with check (public.is_admin());

create index if not exists course_categories_slug_idx on public.course_categories(slug);
create index if not exists course_categories_order_idx on public.course_categories(order_index);
create index if not exists course_category_courses_category_id_idx on public.course_category_courses(category_id);
create index if not exists course_category_courses_course_id_idx on public.course_category_courses(course_id);
create index if not exists course_tags_slug_idx on public.course_tags(slug);
create index if not exists course_tag_assignments_course_id_idx on public.course_tag_assignments(course_id);
create index if not exists course_tag_assignments_tag_id_idx on public.course_tag_assignments(tag_id);
create index if not exists course_instructors_course_id_idx on public.course_instructors(course_id);
create index if not exists course_prerequisites_course_id_idx on public.course_prerequisites(course_id);
create index if not exists course_prerequisites_prerequisite_course_id_idx on public.course_prerequisites(prerequisite_course_id);
create index if not exists course_favorites_user_id_idx on public.course_favorites(user_id);
create index if not exists course_favorites_course_id_idx on public.course_favorites(course_id);
create index if not exists recently_viewed_courses_user_id_idx on public.recently_viewed_courses(user_id);
create index if not exists recently_viewed_courses_course_id_idx on public.recently_viewed_courses(course_id);
create index if not exists recently_viewed_courses_viewed_at_idx on public.recently_viewed_courses(user_id, viewed_at desc);
create index if not exists course_reviews_placeholder_course_id_idx on public.course_reviews_placeholder(course_id);
create index if not exists lesson_notes_user_id_idx on public.lesson_notes(user_id);
create index if not exists lesson_notes_lesson_id_idx on public.lesson_notes(lesson_id);
create index if not exists lesson_notes_search_idx on public.lesson_notes using gin(to_tsvector('english', content));
create index if not exists lesson_bookmarks_user_id_idx on public.lesson_bookmarks(user_id);
create index if not exists lesson_bookmarks_lesson_id_idx on public.lesson_bookmarks(lesson_id);
create index if not exists lesson_resume_user_id_idx on public.lesson_resume(user_id);
create index if not exists lesson_resume_lesson_id_idx on public.lesson_resume(lesson_id);
create index if not exists lesson_resources_lesson_id_idx on public.lesson_resources(lesson_id);
create index if not exists lesson_downloads_user_id_idx on public.lesson_downloads(user_id);
create index if not exists lesson_downloads_lesson_id_idx on public.lesson_downloads(lesson_id);
create index if not exists learning_paths_slug_idx on public.learning_paths(slug);
create index if not exists learning_paths_level_idx on public.learning_paths(level);
create index if not exists learning_path_courses_path_id_idx on public.learning_path_courses(learning_path_id);
create index if not exists learning_path_courses_course_id_idx on public.learning_path_courses(course_id);
create index if not exists user_learning_path_user_id_idx on public.user_learning_path(user_id);
create index if not exists user_learning_path_path_id_idx on public.user_learning_path(learning_path_id);
create index if not exists lesson_video_assets_lesson_id_idx on public.lesson_video_assets(lesson_id);
