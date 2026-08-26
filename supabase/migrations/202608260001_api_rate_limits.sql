create table if not exists public.api_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from anon, authenticated;

create or replace function public.check_api_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max_requests integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_time timestamptz := clock_timestamp();
  current_row public.api_rate_limits%rowtype;
begin
  if p_key is null or length(p_key) < 16 then
    raise exception 'Invalid rate-limit key';
  end if;

  p_window_seconds := greatest(1, least(p_window_seconds, 86400));
  p_max_requests := greatest(1, least(p_max_requests, 10000));

  insert into public.api_rate_limits as limits (
    key_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    p_key,
    current_time,
    1,
    current_time
  )
  on conflict (key_hash) do update
  set
    window_started_at = case
      when limits.window_started_at + make_interval(secs => p_window_seconds) <= current_time
        then current_time
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at + make_interval(secs => p_window_seconds) <= current_time
        then 1
      else limits.request_count + 1
    end,
    updated_at = current_time
  returning * into current_row;

  return query select
    current_row.request_count <= p_max_requests,
    greatest(p_max_requests - current_row.request_count, 0),
    current_row.window_started_at + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.check_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_api_rate_limit(text, integer, integer) to service_role;

comment on table public.api_rate_limits is 'Server-only counters used to rate-limit public API routes across instances.';
