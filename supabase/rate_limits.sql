-- Rate limits: how many times one visitor did something recently, to stop
-- bots (RSVP spam on the shared link, guessing the dashboard password).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- A visitor is a hash of their IP address, never the address itself.

create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  bucket text not null,          -- e.g. "rsvp:<hash>" or "login:<hash>"
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_bucket_time on public.rate_limits (bucket, created_at);

-- Only the server (secret key) may touch it: no policies, so the public
-- (anon) key can neither read nor write.
alter table public.rate_limits enable row level security;

-- Counts this visitor's recent attempts and records this one, in one step,
-- so two requests at the same moment cannot both slip under the limit.
-- Returns true when allowed, false when over the limit.
create or replace function public.rate_limit_hit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  -- One visitor at a time per bucket
  perform pg_advisory_xact_lock(hashtext(p_bucket));

  -- Forget attempts older than a day
  delete from rate_limits where bucket = p_bucket and created_at < now() - interval '1 day';

  select count(*) into recent from rate_limits
  where bucket = p_bucket and created_at > now() - make_interval(secs => p_window_seconds);

  if recent >= p_limit then
    return false;
  end if;

  insert into rate_limits (bucket) values (p_bucket);
  return true;
end;
$$;

-- Callable only with the secret key
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
