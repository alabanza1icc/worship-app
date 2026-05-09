-- ============================================================
-- Migration: 005_add_version_id_to_song_parts
-- Purpose: Link song_parts to specific versions
-- Each version of a song has its own set of parts
-- Original/_default version has version_id = NULL
-- ============================================================

-- Add version_id column (nullable, NULL means "original/unspecified version")
ALTER TABLE song_parts 
ADD COLUMN version_id uuid REFERENCES song_versions(id) ON DELETE SET NULL;

-- Create index for efficient version filtering
CREATE INDEX IF NOT EXISTS song_parts_version_id_idx ON song_parts(version_id);

-- Backfill existing parts: assign them to the default version of their song
-- This ensures existing data works correctly after migration
WITH default_versions AS (
  SELECT s.id as song_id, MIN(v.id) as version_id
  FROM songs s
  LEFT JOIN song_versions v ON v.song_id = s.id AND v.is_default = true
  GROUP BY s.id
)
UPDATE song_parts sp
SET version_id = dv.version_id
FROM default_versions dv
WHERE sp.song_id = dv.song_id AND dv.version_id IS NOT NULL;

-- Add constraint: if version_id is set, it must belong to the same song
-- This is enforced at application level, but we add a helpful comment
COMMENT ON COLUMN song_parts.version_id IS 
  'Links parts to a specific version. NULL means original/unversioned parts. 
   When creating a new version, copy parts with new version_id.';