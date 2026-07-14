-- Supabase pg_cron + pg_net: daily market memory pipeline
--
-- Prerequisites (Dashboard → Database → Extensions):
--   - pg_cron
--   - pg_net
--
-- Before running:
--   1) Replace <SITE_URL> with your deployed app origin (e.g. https://marketmemory.example.com)
--   2) Replace <CRON_SECRET> with the same value as app env CRON_SECRET
--   3) Adjust cron expression if needed (pg_cron uses UTC)
--
-- App endpoint: POST <SITE_URL>/cron/daily-market-memory
-- Default marketDate (body omitted): Asia/Tokyo yesterday (D-1), via resolveCronDefaultMarketDate.
--
-- To reschedule, unschedule first:
--   select cron.unschedule('daily-market-memory');

select cron.schedule(
  'daily-market-memory',
  '0 1 * * *', -- daily 01:00 UTC (10:00 JST); change as needed
  $$
  select net.http_post(
    url := '<SITE_URL>/cron/daily-market-memory',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
  $$
);

-- Optional: verify scheduled job
-- select jobid, jobname, schedule, command from cron.job where jobname = 'daily-market-memory';

-- Optional: inspect recent HTTP responses
-- select id, status_code, timed_out, error_msg, created
-- from net._http_response
-- order by id desc
-- limit 10;
