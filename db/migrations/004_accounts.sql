-- Comptes visiteurs : sessions, nom affiché, newsletter et messages de contact

alter table users add column if not exists display_name text;

-- Le jeton de session n'est jamais stocké en clair : seulement son empreinte SHA-256
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_user_idx on sessions (user_id);

create table newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  locale text not null default 'en' check (locale in ('fr', 'en')),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id bigserial primary key,
  name text not null,
  email text not null,
  message text not null,
  locale text not null default 'en' check (locale in ('fr', 'en')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
