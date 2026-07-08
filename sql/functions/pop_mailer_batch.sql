-- Pop up to batch_size messages from the mailer PGMQ queue in a single RPC call.
-- Stops early when the queue is empty (no unnecessary pops).
CREATE OR REPLACE FUNCTION pop_mailer_batch(batch_size int DEFAULT 3)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET SEARCH_PATH = ''
AS $$
DECLARE
  capped int;
  result jsonb := '[]'::jsonb;
  message_record record;
  i int;
BEGIN
  capped := GREATEST(LEAST(COALESCE(batch_size, 3), 10), 0);

  IF capped = 0 THEN
    RETURN result;
  END IF;

  FOR i IN 1..capped LOOP
    SELECT * INTO message_record FROM pgmq.pop('mailer') LIMIT 1;

    IF message_record IS NULL THEN
      EXIT;
    END IF;

    result := result || jsonb_build_array(message_record.message::jsonb);
  END LOOP;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in pop_mailer_batch: %', SQLERRM;
    RETURN '[]'::jsonb;
END;
$$;
