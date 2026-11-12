-- LayR : schéma initial (ressources ET inspiration dans la même table websites)

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  role text not null default 'visitor' check (role in ('visitor', 'admin')),
  preferred_language text check (preferred_language in ('fr', 'en')),
  preferred_theme text check (preferred_theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id serial primary key,
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  description_fr text not null default '',
  description_en text not null default '',
  created_at timestamptz not null default now()
);

create table badges (
  id serial primary key,
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  color text not null default '#5B4632',
  icon text,
  description_fr text not null default '',
  description_en text not null default ''
);

create table websites (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  domain text not null,
  title text not null,
  title_fr text,
  title_en text,
  description_fr text,
  description_en text,
  screenshot_url text,
  rating numeric(3, 1) check (rating is null or (rating >= 0 and rating <= 10)),
  ai_review_fr text,
  ai_review_en text,
  category_id integer references categories (id) on delete set null,
  tags text[] not null default '{}',
  badges text[] not null default '{}',
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  content_type text not null default 'resource' check (content_type in ('resource', 'inspiration')),
  -- champs spécifiques à l'inspiration (nuls pour les ressources)
  inspiration_category text,
  creator_name text,
  visual_tags text[] not null default '{}',
  visual_style text,
  color_palette text,
  layout_type text,
  animation_type text,
  industry text,
  search_document tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recherche plein texte : maintenue par trigger (les colonnes générées n'acceptent pas array_to_string)
create function websites_refresh_search() returns trigger
language plpgsql as $$
begin
  new.search_document :=
    setweight(to_tsvector('simple',
      coalesce(new.title, '') || ' ' || coalesce(new.title_fr, '') || ' ' || coalesce(new.title_en, '') || ' ' ||
      coalesce(new.domain, '') || ' ' || coalesce(new.creator_name, '')), 'A')
    || setweight(to_tsvector('simple',
      coalesce(new.description_fr, '') || ' ' || coalesce(new.description_en, '')), 'B')
    || setweight(to_tsvector('simple',
      array_to_string(new.tags, ' ') || ' ' || array_to_string(new.badges, ' ') || ' ' ||
      array_to_string(new.visual_tags, ' ')), 'C');
  return new;
end;
$$;

create trigger websites_search_trigger
before insert or update on websites
for each row execute function websites_refresh_search();

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  website_id uuid not null references websites (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, website_id)
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections (id) on delete cascade,
  website_id uuid not null references websites (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (collection_id, website_id)
);

create index websites_status_idx on websites (status);
create index websites_content_type_idx on websites (content_type);
create index websites_category_idx on websites (category_id);
create index websites_tags_idx on websites using gin (tags);
create index websites_badges_idx on websites using gin (badges);
create index websites_search_idx on websites using gin (search_document);
create index favorites_website_idx on favorites (website_id);
