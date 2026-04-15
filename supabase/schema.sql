-- Framic database schema
-- Run this in your Supabase SQL Editor to set up the tables

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  image_hash text not null,
  exif_data jsonb,
  ai_analysis jsonb not null,
  settings_output jsonb not null,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  worked boolean not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  user_device text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_analyses_image_hash on analyses(image_hash);
create index if not exists idx_analyses_created_at on analyses(created_at desc);
create index if not exists idx_feedback_analysis_id on feedback(analysis_id);
