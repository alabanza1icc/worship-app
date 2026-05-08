-- ============================================================
-- WorshipApp Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- UTILITY: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles
-- User profiles synced from Clerk via webhook
-- ============================================================

CREATE TABLE profiles (
  id          uuid PRIMARY KEY, -- equals Clerk user ID
  email       text NOT NULL,
  full_name   text NOT NULL,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'participant'
                CONSTRAINT profiles_role_check
                CHECK (role IN ('admin', 'participant', 'musician', 'multimedia')),
  instrument  text,
  phone       text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON profiles FOR ALL USING (true);

-- ============================================================
-- TABLE: events
-- Worship services, rehearsals, and special events
-- ============================================================

CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  event_type   text NOT NULL DEFAULT 'servicio_dominical'
                 CONSTRAINT events_event_type_check
                 CHECK (event_type IN (
                   'servicio_dominical',
                   'ensayo',
                   'evento_especial',
                   'servicio_jovenes',
                   'otro'
                 )),
  event_date   date NOT NULL,
  start_time   time NOT NULL,
  end_time     time,
  location     text,
  description  text,
  is_live      boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX events_event_date_idx ON events(event_date);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON events FOR ALL USING (true);

-- ============================================================
-- TABLE: songs
-- Central song repository / library
-- ============================================================

CREATE TABLE songs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  artist       text NOT NULL,
  original_key text NOT NULL,
  tempo        integer,
  tags         text[],
  notes        text,
  spotify_url  text,
  youtube_url  text,
  has_audio    boolean NOT NULL DEFAULT false,
  status       text NOT NULL DEFAULT 'active'
                 CONSTRAINT songs_status_check
                 CHECK (status IN ('active', 'archived')),
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON songs FOR ALL USING (true);

-- ============================================================
-- TABLE: song_parts
-- Sections within a song: verse, chorus, bridge, etc.
-- content uses chord notation: [La]Cantaré de Tu bondad
-- ============================================================

CREATE TABLE song_parts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id     uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  name        text NOT NULL,
  content     text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX song_parts_song_id_order_idx ON song_parts(song_id, order_index);

CREATE TRIGGER song_parts_updated_at
  BEFORE UPDATE ON song_parts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE song_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON song_parts FOR ALL USING (true);

-- ============================================================
-- TABLE: song_versions
-- Alternative arrangements of a song
-- ============================================================

CREATE TABLE song_versions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id    uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE song_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON song_versions FOR ALL USING (true);

-- ============================================================
-- TABLE: song_chart_pro
-- ChartPro format chord charts (per part or per version)
-- Constraint: exactly one of part_id or version_id must be set
-- ============================================================

CREATE TABLE song_chart_pro (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id      uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  part_id      uuid REFERENCES song_parts(id) ON DELETE CASCADE,
  version_id   uuid REFERENCES song_versions(id) ON DELETE CASCADE,
  content      text NOT NULL,
  original_key text,
  tempo        integer,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT song_chart_pro_requires_part_or_version
    CHECK (
      (part_id IS NOT NULL AND version_id IS NULL) OR
      (part_id IS NULL AND version_id IS NOT NULL)
    )
);

CREATE TRIGGER song_chart_pro_updated_at
  BEFORE UPDATE ON song_chart_pro
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE song_chart_pro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON song_chart_pro FOR ALL USING (true);

-- ============================================================
-- TABLE: audio_tracks
-- Audio files: multitracks, stems, reference tracks
-- ============================================================

CREATE TABLE audio_tracks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id    uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  file_name  text NOT NULL,
  file_url   text NOT NULL,
  file_type  text NOT NULL
               CONSTRAINT audio_tracks_file_type_check
               CHECK (file_type IN ('multitrack', 'stem', 'reference', 'backing_track')),
  instrument text,
  stem_type  text,
  file_size  integer,
  duration   integer, -- seconds
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER audio_tracks_updated_at
  BEFORE UPDATE ON audio_tracks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON audio_tracks FOR ALL USING (true);

-- ============================================================
-- TABLE: event_team
-- Team member assignments for events
-- ============================================================

CREATE TABLE event_team (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_type  text NOT NULL
               CONSTRAINT event_team_role_type_check
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
               )),
  status     text NOT NULL DEFAULT 'pending'
               CONSTRAINT event_team_status_check
               CHECK (status IN ('confirmed', 'pending', 'declined')),
  notes      text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE event_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON event_team FOR ALL USING (true);

-- ============================================================
-- TABLE: event_songs
-- Songs in an event setlist (ordered)
-- ============================================================

CREATE TABLE event_songs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  song_id        uuid NOT NULL REFERENCES songs(id) ON DELETE RESTRICT,
  custom_key     text,
  director_notes text,
  order_index    integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX event_songs_event_id_order_idx ON event_songs(event_id, order_index);

ALTER TABLE event_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON event_songs FOR ALL USING (true);

-- ============================================================
-- TABLE: files
-- Audio files and documents attached to songs or events
-- ============================================================

CREATE TABLE files (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id     uuid REFERENCES songs(id) ON DELETE CASCADE,
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  file_name   text NOT NULL,
  file_type   text NOT NULL
                CONSTRAINT files_file_type_check
                CHECK (file_type IN ('audio', 'pdf', 'image')),
  file_url    text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON files FOR ALL USING (true);

-- ============================================================
-- TABLE: sermons
-- Sermon notes associated with an event (one per event)
-- ============================================================

CREATE TABLE sermons (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  title               text NOT NULL,
  preacher            text NOT NULL,
  content             text NOT NULL,
  scripture_reference text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON sermons FOR ALL USING (true);

-- ============================================================
-- TABLE: notifications
-- In-app notifications for team members
-- ============================================================

CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL
               CONSTRAINT notifications_type_check
               CHECK (type IN (
                 'event_invite',
                 'song_update',
                 'team_change',
                 'schedule_change'
               )),
  title      text NOT NULL,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  data       jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_profile_id_is_read_idx ON notifications(profile_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON notifications FOR ALL USING (true);
