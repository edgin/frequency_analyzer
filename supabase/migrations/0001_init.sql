-- Delay Resonance Explorer — initial schema, RLS and storage policies.
-- Run this whole file in the Supabase SQL Editor for your project.
-- The app uses the anon key only; RLS is what protects each user's data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (description is null or char_length(description) <= 400),
  mode text not null default 'mono' check (mode in ('mono', 'stereo')),
  filter_type text not null default 'feedback'
    check (filter_type in ('feedforward', 'feedback')),
  delay_left_ms numeric not null check (delay_left_ms between 1 and 50),
  delay_right_ms numeric not null check (delay_right_ms between 1 and 50),
  feedback numeric not null default 0.95 check (feedback between 0 and 0.98),
  dry_wet numeric not null default 0.4 check (dry_wet between 0 and 1),
  signal_type text not null default 'sine'
    check (signal_type in ('sine', 'sawtooth', 'noise', 'impulse')),
  input_freq numeric check (input_freq between 50 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe upgrade path if the earlier draft schema was already applied.
alter table public.presets
  add column if not exists filter_type text not null default 'feedback';

create table if not exists public.audio_renders (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  duration_seconds numeric not null check (duration_seconds > 0),
  sample_rate integer not null check (sample_rate > 0),
  created_at timestamptz not null default now()
);

-- One audio snapshot per preset; the app upserts on this key.
create unique index if not exists audio_renders_preset_id_key
  on public.audio_renders (preset_id);

create index if not exists presets_user_id_created_at_idx
  on public.presets (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists presets_set_updated_at on public.presets;
create trigger presets_set_updated_at
  before update on public.presets
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Grants and RLS
-- ---------------------------------------------------------------------------

revoke all on public.presets from anon;
revoke all on public.audio_renders from anon;

grant select, insert, update, delete on public.presets to authenticated;
grant select, insert, update, delete on public.audio_renders to authenticated;

alter table public.presets enable row level security;
alter table public.audio_renders enable row level security;

drop policy if exists "Users can read their own presets" on public.presets;
create policy "Users can read their own presets"
  on public.presets for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own presets" on public.presets;
create policy "Users can insert their own presets"
  on public.presets for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own presets" on public.presets;
create policy "Users can update their own presets"
  on public.presets for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own presets" on public.presets;
create policy "Users can delete their own presets"
  on public.presets for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own audio renders" on public.audio_renders;
create policy "Users can read their own audio renders"
  on public.audio_renders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own audio renders" on public.audio_renders;
create policy "Users can insert their own audio renders"
  on public.audio_renders for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.presets p
      where p.id = audio_renders.preset_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update their own audio renders" on public.audio_renders;
create policy "Users can update their own audio renders"
  on public.audio_renders for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.presets p
      where p.id = audio_renders.preset_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their own audio renders" on public.audio_renders;
create policy "Users can delete their own audio renders"
  on public.audio_renders for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Private storage bucket for WAV snapshots
-- Files live at <user_id>/<preset_id>.wav
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('preset-audio', 'preset-audio', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read their own preset audio" on storage.objects;
create policy "Users can read their own preset audio"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload their own preset audio" on storage.objects;
create policy "Users can upload their own preset audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own preset audio" on storage.objects;
create policy "Users can update their own preset audio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own preset audio" on storage.objects;
create policy "Users can delete their own preset audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
