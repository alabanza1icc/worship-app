-- ============================================================
-- Migration 003: Clerk-compatible profile IDs
-- Clerk user IDs are text values like user_xxx, not UUIDs.
-- ============================================================

-- Existing policies compare profile UUIDs to Supabase auth.uid().
-- WorshipApp uses Clerk and server-side service-role access, so policies
-- are reset to permissive app-level policies for now.
DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_created_by_fkey;
ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_profile_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;
ALTER TABLE event_templates DROP CONSTRAINT IF EXISTS event_templates_created_by_fkey;
ALTER TABLE event_bosquejo DROP CONSTRAINT IF EXISTS event_bosquejo_leader_id_fkey;
ALTER TABLE event_attendance DROP CONSTRAINT IF EXISTS event_attendance_profile_id_fkey;

ALTER TABLE profiles
  ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE events
  ALTER COLUMN created_by TYPE text USING created_by::text;

ALTER TABLE songs
  ALTER COLUMN created_by TYPE text USING created_by::text;

ALTER TABLE event_team
  ALTER COLUMN profile_id TYPE text USING profile_id::text;

ALTER TABLE notifications
  ALTER COLUMN profile_id TYPE text USING profile_id::text;

ALTER TABLE event_templates
  ALTER COLUMN created_by TYPE text USING created_by::text;

ALTER TABLE event_bosquejo
  ALTER COLUMN leader_id TYPE text USING leader_id::text;

ALTER TABLE event_attendance
  ALTER COLUMN profile_id TYPE text USING profile_id::text;

ALTER TABLE events
  ADD CONSTRAINT events_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE songs
  ADD CONSTRAINT songs_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE event_team
  ADD CONSTRAINT event_team_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_templates
  ADD CONSTRAINT event_templates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE event_bosquejo
  ADD CONSTRAINT event_bosquejo_leader_id_fkey
  FOREIGN KEY (leader_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_attendance
  ADD CONSTRAINT event_attendance_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

DO $$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
      'allow_all_' || table_record.tablename,
      table_record.tablename
    );
  END LOOP;
END $$;
