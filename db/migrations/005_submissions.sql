-- Propositions de sites par les visiteurs : traitées par l'admin (analyse IA ou saisie manuelle)

create table submissions (
  id bigserial primary key,
  url text not null,
  email text,
  note text not null default '',
  locale text not null default 'en' check (locale in ('fr', 'en')),
  status text not null default 'new' check (status in ('new', 'processed', 'rejected')),
  created_at timestamptz not null default now()
);

create index submissions_status_idx on submissions (status, created_at desc);
