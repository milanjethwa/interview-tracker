-- ============================================================================
-- InterviewPulse — Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. Interviews Table
create table if not exists public.interviews (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  role text not null,
  round text not null default 'Technical Round 1',
  date text not null, -- YYYY-MM-DD
  time text not null default '10:00', -- HH:mm
  duration_minutes integer not null default 60,
  status text not null default 'scheduled', -- scheduled | completed | passed | offer | rejected
  interviewer text default '',
  meeting_link text default '',
  rating integer not null default 3 check (rating >= 1 and rating <= 5),
  skills_tested text[] not null default '{}',
  went_well text[] not null default '{}',
  to_improve text[] not null default '{}',
  questions_asked text[] not null default '{}',
  overall_notes text not null default '',
  created_at timestamptz not null default now()
);

-- 2. Skills Table
create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null default 'Frontend',
  proficiency integer not null default 60 check (proficiency >= 0 and proficiency <= 100),
  confidence integer not null default 3 check (confidence >= 1 and confidence <= 5),
  target_level integer not null default 85 check (target_level >= 0 and target_level <= 100),
  strengths text not null default '',
  improvement_plan text not null default '',
  last_practiced text not null default '',
  created_at timestamptz not null default now()
);

-- Indexes for fast calendar and status queries
create index if not exists idx_interviews_date on public.interviews(date);
create index if not exists idx_interviews_status on public.interviews(status);
create index if not exists idx_skills_category on public.skills(category);

-- Enable Row Level Security (Open for anon/public demo by default; customize for auth.uid() if adding Auth)
alter table public.interviews enable row level security;
alter table public.skills enable row level security;

create policy "Allow all access to interviews"
  on public.interviews
  for all
  using (true)
  with check (true);

create policy "Allow all access to skills"
  on public.skills
  for all
  using (true)
  with check (true);

-- 3. Lifetime Purchases Table (₹99 INR / $1 USD Lifetime Access)
create table if not exists public.lifetime_purchases (
  id uuid primary key default uuid_generate_v4(),
  plan_name text not null default 'Lifetime Pro',
  currency text not null default 'INR', -- 'INR' (99) or 'USD' (1)
  amount numeric not null default 99,
  payment_method text not null default 'UPI',
  reference_id text not null,
  purchased_at timestamptz not null default now()
);

alter table public.lifetime_purchases enable row level security;

create policy "Allow all access to lifetime_purchases"
  on public.lifetime_purchases
  for all
  using (true)
  with check (true);

