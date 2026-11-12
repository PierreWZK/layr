-- Slug lisible pour les URL de fiche, et journal d'événements pour Tendances / Populaires.

alter table websites add column slug text;
update websites set slug = regexp_replace(lower(domain), '[^a-z0-9]+', '-', 'g') where slug is null;
alter table websites alter column slug set not null;
create unique index websites_slug_idx on websites (slug);

-- view : ouverture d'une fiche ; visit : clic vers le site d'origine
create table website_events (
  id bigserial primary key,
  website_id uuid not null references websites (id) on delete cascade,
  kind text not null check (kind in ('view', 'visit')),
  created_at timestamptz not null default now()
);

create index website_events_site_time_idx on website_events (website_id, created_at desc);
