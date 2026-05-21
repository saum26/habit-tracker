-- ============================================================
-- Habit Tracker – Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. PROFILES
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text        not null default '',
  avatar_color text        not null default '#9C89B8',
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert to authenticated with check (auth.uid() = id);


-- 2. HABITS
create table if not exists habits (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text        not null default '',
  color       text        not null default '#9C89B8',
  icon        text        not null default '⭐',
  is_active   boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);

alter table habits enable row level security;

create policy "Users manage own habits"
  on habits for all to authenticated using (auth.uid() = user_id);


-- 3. HABIT COMPLETIONS
create table if not exists habit_completions (
  id             uuid        primary key default gen_random_uuid(),
  habit_id       uuid        not null references habits(id) on delete cascade,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  completed_date date        not null,
  notes          text,
  created_at     timestamptz not null default now(),
  unique (habit_id, completed_date)
);

alter table habit_completions enable row level security;

create policy "Users manage own completions"
  on habit_completions for all to authenticated using (auth.uid() = user_id);

-- Leaderboard needs to read all completions (aggregated only via the RPC below)
create policy "Authenticated users can read all completions"
  on habit_completions for select to authenticated using (true);


-- 4. HABIT NOTES
create table if not exists habit_notes (
  id        uuid        primary key default gen_random_uuid(),
  habit_id  uuid        not null references habits(id) on delete cascade,
  user_id   uuid        not null references auth.users(id) on delete cascade,
  note      text        not null,
  note_date date        not null default current_date,
  created_at timestamptz not null default now()
);

alter table habit_notes enable row level security;

create policy "Users manage own notes"
  on habit_notes for all to authenticated using (auth.uid() = user_id);


-- 5. LEADERBOARD RPC
-- SECURITY DEFINER so it can aggregate across all users safely
create or replace function get_leaderboard()
returns table (
  user_id              uuid,
  display_name         text,
  avatar_color         text,
  habits_done_today    bigint,
  total_habits         bigint,
  rings_closed_today   boolean,
  completion_percentage numeric
)
language sql
security definer
stable
as $$
  select
    p.id                                                      as user_id,
    p.display_name,
    p.avatar_color,
    count(distinct hc.habit_id) filter (
      where hc.completed_date = current_date
    )                                                         as habits_done_today,
    count(distinct h.id)                                      as total_habits,
    (
      count(distinct hc.habit_id) filter (
        where hc.completed_date = current_date
      ) = count(distinct h.id)
      and count(distinct h.id) > 0
    )                                                         as rings_closed_today,
    case
      when count(distinct h.id) = 0 then 0
      else round(
        100.0 * count(distinct hc2.habit_id) /
        (count(distinct h.id) * 30.0),
        1
      )
    end                                                       as completion_percentage
  from profiles p
  left join habits h
    on h.user_id = p.id and h.is_active = true
  left join habit_completions hc
    on hc.habit_id = h.id
  left join habit_completions hc2
    on hc2.habit_id = h.id
   and hc2.completed_date >= current_date - interval '29 days'
   and hc2.completed_date <= current_date
  group by p.id, p.display_name, p.avatar_color
  having count(distinct h.id) > 0
  order by completion_percentage desc, habits_done_today desc;
$$;

grant execute on function get_leaderboard() to authenticated;


-- 6. AUTO-CREATE PROFILE ON SIGNUP
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, display_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#9C89B8')
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_color = excluded.avatar_color;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
