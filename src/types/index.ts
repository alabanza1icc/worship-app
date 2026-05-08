// ============================================================
// WorshipApp TypeScript Types
// Mirrors the Supabase database schema exactly.
// ============================================================

// ----------------------------------------------------------------
// Profile
// ----------------------------------------------------------------

export type ProfileRole = 'admin' | 'leader' | 'participant' | 'musician' | 'multimedia';
export type MinistryRole = 'worship' | 'audiovisual' | 'dance';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: ProfileRole;
  roles: MinistryRole[];
  instrument: string | null;
  instruments: string[];
  can_sing: boolean;
  is_leader: boolean;
  phone: string | null;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: 'Administrador',
  leader: 'Líder',
  participant: 'Participante',
  musician: 'Músico',
  multimedia: 'Multimedia',
};

export const MINISTRY_LABELS: Record<MinistryRole, string> = {
  worship: 'Alabanza',
  audiovisual: 'Audiovisual',
  dance: 'Danza',
};

// ----------------------------------------------------------------
// Event
// ----------------------------------------------------------------

export type EventType =
  | 'servicio_dominical'
  | 'ensayo'
  | 'evento_especial'
  | 'servicio_jovenes'
  | 'otro';

export interface Event {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string;    // ISO date string: "YYYY-MM-DD"
  start_time: string;    // HH:MM or HH:MM:SS
  end_time: string | null;
  location: string | null;
  description: string | null;
  is_live: boolean;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Event Team
// ----------------------------------------------------------------

export type EventTeamRoleType =
  | 'lead_singer'
  | 'background_vocals'
  | 'guitar'
  | 'bass'
  | 'drums'
  | 'piano'
  | 'keys'
  | 'multimedia'
  | 'dance';

export type EventTeamStatus = 'confirmed' | 'pending' | 'declined';

export interface EventTeamMember {
  id: string;
  event_id: string;
  profile_id: string;
  role_type: EventTeamRoleType;
  status: EventTeamStatus;
  notes: string | null;
  created_at: string;
  profile?: Profile;
}

// ----------------------------------------------------------------
// Song
// ----------------------------------------------------------------

export type SongStatus = 'active' | 'archived';

export interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: string;
  tempo: number | null;
  tags: string[] | null;
  notes: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  has_audio: boolean;
  status: SongStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Song Part
// content uses chord notation: [La]Cantaré de Tu bondad
// ----------------------------------------------------------------

export interface SongPart {
  id: string;
  song_id: string;
  name: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Song Version
// ----------------------------------------------------------------

export interface SongVersion {
  id: string;
  song_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

// ----------------------------------------------------------------
// Song ChartPro
// Either part_id or version_id is set — never both, never neither
// ----------------------------------------------------------------

export interface SongChartPro {
  id: string;
  song_id: string;
  part_id: string | null;
  version_id: string | null;
  content: string;        // JSON string of ChartPro format
  original_key: string | null;
  tempo: number | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Audio Track
// ----------------------------------------------------------------

export type AudioTrackFileType = 'multitrack' | 'stem' | 'reference' | 'backing_track';

export interface AudioTrack {
  id: string;
  song_id: string;
  file_name: string;
  file_url: string;
  file_type: AudioTrackFileType;
  instrument: string | null;
  stem_type: string | null;
  file_size: number | null;
  duration: number | null;  // seconds
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Event Song (setlist entry)
// ----------------------------------------------------------------

export interface EventSong {
  id: string;
  event_id: string;
  song_id: string;
  custom_key: string | null;
  director_notes: string | null;
  order_index: number;
  created_at: string;
  song?: Song & { song_parts: SongPart[] };
}

// ----------------------------------------------------------------
// File
// ----------------------------------------------------------------

export type FileType = 'audio' | 'pdf' | 'image';

export interface AppFile {
  id: string;
  song_id: string | null;
  event_id: string | null;
  file_name: string;
  file_type: FileType;
  file_url: string;
  description: string | null;
  created_at: string;
}

// ----------------------------------------------------------------
// Sermon
// ----------------------------------------------------------------

export interface Sermon {
  id: string;
  event_id: string;
  title: string;
  preacher: string;
  content: string;
  scripture_reference: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Notification
// ----------------------------------------------------------------

export type NotificationType =
  | 'event_invite'
  | 'song_update'
  | 'team_change'
  | 'schedule_change'
  | 'bosquejo';

export interface Notification {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

// ----------------------------------------------------------------
// Event Bosquejo
// ----------------------------------------------------------------

export interface EventBosquejo {
  id: string;
  event_id: string;
  leader_id: string;
  q1_respuesta: string;
  q2_respuesta: string;
  notas_adicionales: string | null;
  email_enviado: boolean;
  email_enviado_at: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Event Attendance
// ----------------------------------------------------------------

export type AttendanceStatus = 'confirmed' | 'declined' | 'pending';

export interface EventAttendance {
  id: string;
  event_id: string;
  profile_id: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Composite / Detail types (for API responses with joins)
// ----------------------------------------------------------------

export interface EventWithDetails extends Event {
  event_songs: EventSong[];
  event_team: EventTeamMember[];
  sermon: Sermon | null;
}

export interface SongWithDetails extends Song {
  song_parts: SongPart[];
  song_versions: SongVersion[];
  audio_tracks: AudioTrack[];
}
