-- Pravaah Supabase schema.
-- Run this ONCE in the Supabase SQL Editor after creating a new project.
-- The backend uses the service role key so RLS is bypassed; policies are
-- added anyway so that direct public reads can be enabled later if wanted.

-- ---------------- Tables ----------------

create table if not exists public.zones (
  id          text primary key,
  lat         double precision not null,
  lng         double precision not null,
  radius_m    integer not null,
  severity    text not null check (severity in ('low','medium','high')),
  name        text not null,
  source      text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.reports (
  id              text primary key,
  lat             double precision not null,
  lng             double precision not null,
  description     text not null,
  water_depth_cm  integer,
  severity        text not null,
  confidence      integer not null default 60,
  verified        boolean not null default false,
  reporter_name   text,
  ai_summary      text,
  ai_engine       text,
  created_at      timestamptz not null default now()
);

create table if not exists public.sos (
  id           text primary key,
  lat          double precision not null,
  lng          double precision not null,
  person_name  text not null,
  condition    text not null,
  contact      text,
  status       text not null default 'open',
  created_at   timestamptz not null default now()
);

create table if not exists public.vulnerable (
  id                 text primary key,
  person_name        text not null,
  age                integer,
  condition          text not null,
  lat                double precision not null,
  lng                double precision not null,
  primary_contact    text not null,
  secondary_contact  text,
  created_at         timestamptz not null default now()
);

create table if not exists public.alerts (
  id          text primary key,
  kind        text not null,
  text        text not null,
  extra       jsonb,
  ts          timestamptz not null default now()
);

create table if not exists public.shelters (
  id         text primary key,
  name       text not null,
  address    text not null,
  lat        double precision not null,
  lng        double precision not null,
  capacity   integer not null default 0,
  contact    text,
  amenities  text,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists alerts_ts_idx          on public.alerts (ts desc);
create index if not exists sos_status_idx         on public.sos (status);

-- ---------------- Row Level Security ----------------
-- The backend uses the service role key which bypasses RLS by design.
-- Enable RLS so direct anon access is blocked unless policies say otherwise.

alter table public.zones      enable row level security;
alter table public.reports    enable row level security;
alter table public.sos        enable row level security;
alter table public.vulnerable enable row level security;
alter table public.alerts     enable row level security;
alter table public.shelters   enable row level security;

-- Optional: public read access for a shared live map experience.
-- Uncomment to allow anon clients to read zones and alerts directly.
-- create policy "zones read"  on public.zones  for select using (true);
-- create policy "alerts read" on public.alerts for select using (true);

-- ---------------- Seed flood zones (idempotent) ----------------

insert into public.zones (id, lat, lng, radius_m, severity, name, source) values
  ('Z-ANDH-01', 19.1197, 72.8468, 650, 'high',   'Andheri subway',       'satellite+reports'),
  ('Z-KURL-01', 19.0728, 72.8826, 900, 'high',   'Kurla LBS stretch',    'satellite'),
  ('Z-SION-01', 19.0472, 72.8632, 500, 'medium', 'Sion circle',          'reports'),
  ('Z-DADR-01', 19.0176, 72.8562, 420, 'medium', 'Dadar TT',             'reports'),
  ('Z-HIND-01', 19.0459, 72.8395, 700, 'high',   'Hindmata junction',    'satellite+reports'),
  ('Z-BAND-01', 19.0596, 72.8295, 350, 'medium', 'Bandra reclamation',   'reports'),
  ('Z-WORL-01', 18.9930, 72.8176, 400, 'low',    'Worli sea face',       'satellite'),
  ('Z-POWA-01', 19.1176, 72.9060, 800, 'medium', 'Powai lake road',      'reports')
on conflict (id) do nothing;

insert into public.shelters (id, name, address, lat, lng, capacity, contact, amenities) values
  ('S-BKC-01', 'MMRDA Grounds BKC', 'Bandra Kurla Complex, Bandra East', 19.0674, 72.8697, 1200, '+91 22 2659 0000', 'Food, water, medical, mobile charging'),
  ('S-DADR-01', 'Shivaji Park Shelter', 'Dadar West', 19.0273, 72.8396, 800, '+91 22 2446 1000', 'Food, water, basic first aid'),
  ('S-ANDH-01', 'Andheri Sports Complex', 'Veera Desai Road, Andheri West', 19.1361, 72.8267, 900, '+91 22 2634 5000', 'Food, water, medical, blankets'),
  ('S-WORL-01', 'NSCI Dome Worli', 'Dr. Annie Besant Road, Worli', 18.9908, 72.8156, 1500, '+91 22 2492 5000', 'Food, water, medical, mobile charging, pets allowed'),
  ('S-POWA-01', 'IIT Bombay Open Ground', 'Powai', 19.1334, 72.9133, 600, '+91 22 2572 2545', 'Food, water, student volunteers'),
  ('S-GHAT-01', 'Ghatkopar Community Hall', 'Ghatkopar East', 19.0863, 72.9091, 500, '+91 22 2510 0000', 'Food, water')
on conflict (id) do nothing;
