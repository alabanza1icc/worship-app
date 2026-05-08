-- ============================================================
-- Migration 004: Align event_team with app role assignment model
-- ============================================================

ALTER TABLE event_team
  ADD COLUMN IF NOT EXISTS role_type text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE event_team
  ALTER COLUMN function_text DROP NOT NULL;

UPDATE event_team
SET role_type = COALESCE(role_type, function_text, 'guitar')
WHERE role_type IS NULL;

ALTER TABLE event_team
  ALTER COLUMN role_type SET NOT NULL;

ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_role_type_check;
ALTER TABLE event_team ADD CONSTRAINT event_team_role_type_check
  CHECK (role_type IN (
    'lead_singer',
    'background_vocals',
    'guitar',
    'bass',
    'drums',
    'piano',
    'keys',
    'multimedia',
    'dance'
  ));

ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_status_check;
ALTER TABLE event_team ADD CONSTRAINT event_team_status_check
  CHECK (status IN ('confirmed', 'pending', 'declined'));

CREATE INDEX IF NOT EXISTS idx_event_team_event_id ON event_team(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_profile_id ON event_team(profile_id);
