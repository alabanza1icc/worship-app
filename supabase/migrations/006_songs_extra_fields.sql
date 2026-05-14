-- ============================================================
-- Migration 006: Add extra fields to songs from Notion
-- has_sequence: whether song has a backing track sequence
-- has_patch: whether song has a main stage patch
-- repetidera: rotation status (Quemada/Cantada hace poco/Normal/Olvidada)
-- ============================================================

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS has_sequence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_patch    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS repetidera   text    CHECK (repetidera IN ('Quemada','Cantada hace poco','Normal','Olvidada') OR repetidera IS NULL);
