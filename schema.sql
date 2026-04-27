-- schema.sql — Supabase table definitions
-- Run in Supabase Dashboard → SQL Editor

-- ===================================
-- contact_messages
-- ===================================
create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text,
  created_at timestamptz default now()
);

-- Allow anonymous inserts (public contact form)
alter table contact_messages enable row level security;

create policy "Allow anon insert"
  on contact_messages for insert
  to anon
  with check (true);

-- ===================================
-- deletion_requests
-- Stores one-time confirmation tokens for account deletion requests.
-- Not exposed to anon. Edge functions access it with the service-role key.
-- ===================================
create table deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  token        uuid not null default gen_random_uuid(),
  created_at   timestamptz default now(),
  confirmed_at timestamptz,
  expires_at   timestamptz default (now() + interval '24 hours')
);

create index on deletion_requests (token);
create index on deletion_requests (email, created_at);
