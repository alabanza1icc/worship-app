-- ============================================================
-- Migration 002: Multi-role profiles, bosquejo, attendance
-- ============================================================

-- 1. Extend profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS instruments text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS can_sing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_leader boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Drop and recreate role check to include 'leader'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'leader', 'participant', 'musician', 'multimedia'));

-- 2. Event Bosquejo (spiritual programming notes)
CREATE TABLE IF NOT EXISTS event_bosquejo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  leader_id uuid NOT NULL REFERENCES profiles(id),
  q1_respuesta text NOT NULL DEFAULT '',
  q2_respuesta text NOT NULL DEFAULT '',
  notas_adicionales text,
  email_enviado boolean NOT NULL DEFAULT false,
  email_enviado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, leader_id)
);

ALTER TABLE event_bosquejo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_bosquejo" ON event_bosquejo FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_event_bosquejo_event_id ON event_bosquejo(event_id);
CREATE INDEX IF NOT EXISTS idx_event_bosquejo_leader_id ON event_bosquejo(leader_id);

-- 3. Event Attendance (confirm/decline for team members)
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT event_attendance_status_check
    CHECK (status IN ('confirmed', 'declined', 'pending')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_attendance" ON event_attendance FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_profile_id ON event_attendance(profile_id);

-- 4. updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_event_bosquejo_updated_at ON event_bosquejo;
CREATE TRIGGER update_event_bosquejo_updated_at
  BEFORE UPDATE ON event_bosquejo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_attendance_updated_at ON event_attendance;
CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
