-- Lost Pet Finder: initial schema.
-- All tables have RLS enabled with NO policies: every access goes through our server (service role).

create extension if not exists postgis;

-- ---------- Shelters ----------
create table shelters (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,                       -- Supabase auth user who manages this shelter
  name          text not null,
  contact_email text not null,
  phone         text,
  website       text,
  address       text,
  country       text not null check (country in ('US','CA','MX')),
  location      geography(Point, 4326),
  status        text not null default 'pending' check (status in ('pending','verified','suspended')),
  plan_status   text not null default 'none' check (plan_status in ('none','active','past_due','canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  discount_used boolean not null default false,       -- one-time 50% off first payment
  created_at    timestamptz not null default now()
);
create index shelters_location_idx on shelters using gist (location);
create index shelters_owner_idx on shelters (owner_user_id);

-- ---------- Found / stray intakes posted by shelters ----------
create table intakes (
  id          uuid primary key default gen_random_uuid(),
  shelter_id  uuid not null references shelters(id) on delete cascade,
  species     text not null check (species in ('dog','cat','other')),
  breed       text,
  color       text,
  size        text check (size in ('small','medium','large')),
  markings    text,
  collar      text,
  microchip   text,
  found_date  date not null,
  location    geography(Point, 4326),                -- defaults to shelter location if unset
  photo_paths text[] not null default '{}',          -- Supabase Storage paths
  status      text not null default 'open' check (status in ('open','reunited','closed')),
  created_at  timestamptz not null default now()
);
create index intakes_location_idx on intakes using gist (location);
create index intakes_open_idx on intakes (species, found_date) where status = 'open';

-- ---------- Owner searches ----------
create table searches (
  id          uuid primary key default gen_random_uuid(),
  owner_user_id uuid,                                -- null until the owner confirms their email
  owner_email text not null,
  lang        text not null default 'en' check (lang in ('en','es')),
  pet_name    text,
  species     text not null check (species in ('dog','cat','other')),
  breed       text,
  color       text,
  size        text check (size in ('small','medium','large')),
  markings    text,
  collar      text,
  microchip   text,
  lost_date   date not null,
  location    geography(Point, 4326) not null,
  radius_km   integer not null default 40 check (radius_km between 1 and 500),
  alert_email boolean not null default true,
  photo_paths text[] not null default '{}',
  paid        boolean not null default false,
  status      text not null default 'open' check (status in ('open','found','expired')),
  created_at  timestamptz not null default now()
);
create index searches_location_idx on searches using gist (location);
create index searches_open_idx on searches (species, lost_date) where status = 'open';

-- ---------- Possible matches ----------
create table search_matches (
  search_id   uuid not null references searches(id) on delete cascade,
  intake_id   uuid not null references intakes(id) on delete cascade,
  score       integer not null,
  distance_km numeric not null,
  notified_at timestamptz,                           -- set once the owner has been emailed
  created_at  timestamptz not null default now(),
  primary key (search_id, intake_id)
);

-- ---------- Payments ----------
create table payments (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('owner_search','shelter_subscription')),
  search_id   uuid references searches(id) on delete set null,
  shelter_id  uuid references shelters(id) on delete set null,
  stripe_session_id text unique,
  amount_cents integer,
  currency    text,
  status      text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at  timestamptz not null default now()
);

alter table shelters       enable row level security;
alter table intakes        enable row level security;
alter table searches       enable row level security;
alter table search_matches enable row level security;
alter table payments       enable row level security;

-- ---------- Matching ----------
-- Pass 1 (filter): same species, found on/after the date lost, open intake, inside the radius.
-- Pass 2 (score): breed 25, colour 25, size 15, markings 10, base 25 for passing pass 1.
-- Results are only ever shown as "possible matches".
create or replace function find_matches(p_search_id uuid)
returns table (intake_id uuid, score integer, distance_km numeric)
language sql stable as $$
  select
    i.id,
    25
      + case when s.breed  is not null and i.breed  is not null
              and (i.breed ilike '%' || s.breed || '%' or s.breed ilike '%' || i.breed || '%') then 25 else 0 end
      + case when s.color  is not null and i.color  is not null
              and (i.color ilike '%' || s.color || '%' or s.color ilike '%' || i.color || '%') then 25 else 0 end
      + case when s.size is not null and s.size = i.size then 15 else 0 end
      + case when s.markings is not null and i.markings is not null and exists (
              select 1 from regexp_split_to_table(lower(s.markings), '\W+') w
              where length(w) > 3 and lower(i.markings) like '%' || w || '%') then 10 else 0 end,
    round((st_distance(coalesce(i.location, sh.location), s.location) / 1000.0)::numeric, 1)
  from searches s
  join intakes i  on i.species = s.species and i.status = 'open' and i.found_date >= s.lost_date
  join shelters sh on sh.id = i.shelter_id and sh.status = 'verified'
  where s.id = p_search_id
    and st_dwithin(coalesce(i.location, sh.location), s.location, s.radius_km * 1000)
  order by 2 desc;
$$;
