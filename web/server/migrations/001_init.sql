create table users (
  id uuid primary key default gen_random_uuid(),
  cash_cents integer not null default 10000000 check (cash_cents >= 0),
  created_at timestamptz not null default now()
);

create table trades (
  id bigint generated always as identity primary key,
  user_id uuid not null references users (id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  quantity integer not null check (quantity > 0),
  price_cents integer not null check (price_cents > 0),
  created_at timestamptz not null default now()
);

create index trades_user_id_created_at_idx on trades (user_id, created_at desc);
