/**
 * Database Trigger Function: welcome_email
 *
 * Enqueues a welcome email when a user becomes email-confirmed:
 * - OAuth signups: INSERT with email_confirmed_at already set
 * - Email/password signups: UPDATE when email_confirmed_at is first set
 *
 * Recipient resolution:
 * - OAuth users: raw_user_meta_data.email
 * - Email/password users: auth.users.email
 */
CREATE OR REPLACE FUNCTION welcome_email()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET SEARCH_PATH = ''
AS $$
DECLARE
    recipient_email text;
BEGIN
    recipient_email := COALESCE(
        new.raw_user_meta_data ->> 'email',
        new.email
    );

    IF recipient_email IS NULL OR btrim(recipient_email) = '' THEN
        RETURN NEW;
    END IF;

    PERFORM pgmq.send(
        queue_name => 'mailer'::text,
        msg => (json_build_object(
            'template', 'welcome'::text,
            'to', recipient_email,
            'data', row_to_json(new.*)
        ))::jsonb
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS welcome_email ON auth.users;
DROP TRIGGER IF EXISTS welcome_email_on_insert ON auth.users;
DROP TRIGGER IF EXISTS welcome_email_on_confirm ON auth.users;

CREATE TRIGGER welcome_email_on_insert
AFTER INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION welcome_email();

CREATE TRIGGER welcome_email_on_confirm
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (
    OLD.email_confirmed_at IS NULL
    AND NEW.email_confirmed_at IS NOT NULL
)
EXECUTE FUNCTION welcome_email();
