-- Create investments table
create table investments (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('gram-altin', '22-ayar-bilezik', 'gumus')),
  amount numeric not null,
  price numeric not null,
  purchase_date timestamptz default now(),
  created_at timestamptz default now()
);

-- Construct real-time security policies (RLS)
alter table investments enable row level security;

-- Policy to allow anonymous read/write (since this is a personal app without auth for now, or we can assume open access given the key usage. 
-- Ideally we'd have auth, but the prompt didn't specify auth mechanism, just "tracking". 
-- Given the keys are in env.txt, I'll allow public access for simplicity, or restricted if I could.
-- For now, let's allow all for anon for this specific table to make it work immediately.)
create policy "Allow all access to investments" on investments
for all
to anon
using (true)
with check (true);
