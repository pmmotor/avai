-- Run this script manually in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.avai (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  bucket text not null default 'avai-uploads',
  storage_path text not null unique,
  file_name text not null,
  file_size bigint not null check (file_size > 0),
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.avai enable row level security;

-- No browser policies are added. The server-side service role performs these
-- test inserts and bypasses RLS. Never put the service-role key in browser code.

insert into storage.buckets (id, name, public, file_size_limit)
values ('avai-uploads', 'avai-uploads', false, 104857600)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

