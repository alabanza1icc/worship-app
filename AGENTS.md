<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WorshipApp - Platform Documentation

## 1. Project Overview

**Project Name:** WorshipApp
**Type:** Full-stack Web Application (Mobile-first)
**Purpose:** Operational management platform and live execution tool for worship teams, music ministries, multimedia, and dance teams in churches.
**Core Functionality:** Centralizes planning (events, songs, assignments) and live execution (live mode with transposition, multitrack playback, and projection-ready lyrics).

---

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.4 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Authentication | Clerk | @clerk/nextjs 6.18.0 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.49.0 |
| Email | Resend | 4.1.0 |
| Routing | TanStack Router | 1.114.0 |
| Drag & Drop | dnd-kit | @dnd-kit/core 6.3.1 |
| Icons | Lucide React | 0.474.0 |
| Date Utils | date-fns | 4.1.0 |
| Webhooks | Svix | 1.24.0 |
| Email Templates | @react-email/components | 0.0.33 |
| Deployment | Vercel | - |

---

## 3. User Roles & Permissions

### 3.1 Role Hierarchy

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Administrator / Music Director | Full CRUD on all resources. Can assign roles, create events, edit songs, manage team |
| **participant** | Regular team member | Read-only access to events they're assigned to. Can view songs, lyrics, and chords |
| **musician** | Instrument player | Same as participant + can see instrument-specific parts and multitracks |
| **multimedia** | Media team | Read-only access to setlist, clean lyrics for projection, and event notes |

### 3.2 Role-Based UI Behavior

- **Admin:** Sees Edit/Delete buttons everywhere, can access all settings, can invite users
- **Participant:** Sees Read-only views, can confirm/decline event attendance
- **Musician:** Sees chord charts prominently, transposition controls, audio player
- **Multimedia:** Sees "Clean View" toggle for projection-ready lyrics without chords

---

## 4. Database Schema

### 4.1 Core Tables

#### `profiles` (User profiles synced from Clerk)
```
id: uuid (primary key, references Clerk user ID)
email: text
full_name: text
avatar_url: text (nullable)
role: text ('admin' | 'participant' | 'musician' | 'multimedia')
instrument: text (nullable) - e.g., "Guitarra", "Piano", "Batería"
phone: text (nullable)
is_active: boolean (default: true)
created_at: timestamp
updated_at: timestamp
```

#### `events` (Worship services/ensembles)
```
id: uuid (primary key)
title: text - e.g., "Servicio Dominical", "Ensayo General"
event_type: text ('servicio_dominical' | 'ensayo' | 'evento_especial' | 'servicio_jovenes' | 'otro')
event_date: date
start_time: time
end_time: time (nullable)
location: text (nullable)
description: text (nullable)
is_live: boolean (default: false)
is_published: boolean (default: false)
created_by: uuid (references profiles.id)
created_at: timestamp
updated_at: timestamp
```

#### `event_team` (Team assignments for events)
```
id: uuid (primary key)
event_id: uuid (references events.id)
profile_id: uuid (references profiles.id)
role_type: text ('lead_singer' | 'background_vocals' | 'guitar' | 'bass' | 'drums' | 'piano' | 'keys' | 'multimedia' | 'dance')
status: text ('confirmed' | 'pending' | 'declined')
notes: text (nullable)
created_at: timestamp
```

#### `songs` (Song repository)
```
id: uuid (primary key)
title: text
artist: text
original_key: text - e.g., "La", "Sol", "Mi"
tempo: integer (BPM)
tags: text[] - e.g., ["adoración", "congregacional"]
notes: text (nullable) - Director notes for this song
spotify_url: text (nullable)
youtube_url: text (nullable)
has_audio: boolean (default: false)
status: text ('active' | 'archived')
created_by: uuid (references profiles.id)
created_at: timestamp
updated_at: timestamp
```

#### `song_parts` (Sections within a song - verses, chorus, bridge)
```
id: uuid (primary key)
song_id: uuid (references songs.id)
name: text - e.g., "Verso 1", "Coro", "Puente"
content: text - Contains lyrics with chord notation (e.g., "[La]Cantaré de Tu bondad")
order_index: integer
created_at: timestamp
updated_at: timestamp
```

#### `song_chart_pro` (ChartPro format chord charts)
```
id: uuid (primary key)
song_id: uuid (references songs.id)
part_id: uuid (nullable, references song_parts.id) - for per-part charts
version_id: uuid (nullable, references song_versions.id) - for per-version charts
content: text - Full ChartPro formatted chord/lyrics content
original_key: text - Original key the chart was written in
tempo: integer - BPM for this specific arrangement
created_at: timestamp
updated_at: timestamp
Note: Either part_id OR version_id must be set (not both, not neither)
```

#### `audio_tracks` (Audio files - multitracks, stems, reference tracks)
```
id: uuid (primary key)
song_id: uuid (references songs.id)
file_name: text
file_url: text
file_type: text ('multitrack' | 'stem' | 'reference' | 'backing_track')
instrument: text (nullable) - e.g., "guitar", "drums"
stem_type: text (nullable)
file_size: integer (nullable)
duration: integer (nullable) - seconds
created_at: timestamp
updated_at: timestamp
```

#### `song_versions` (Alternative versions of songs)
```
id: uuid (primary key)
song_id: uuid (references songs.id)
name: text - e.g., "Versión Acústica", "Versión de Cantante X"
is_default: boolean (default: false)
created_at: timestamp
```

#### `event_songs` (Songs in an event setlist)
```
id: uuid (primary key)
event_id: uuid (references events.id)
song_id: uuid (references songs.id)
custom_key: text (nullable) - Override key for this specific event
director_notes: text (nullable) - Event-specific notes for this song
order_index: integer - Position in setlist
created_at: timestamp
```

#### `files` (Audio files and documents)
```
id: uuid (primary key)
song_id: uuid (references songs.id, nullable)
event_id: uuid (references events.id, nullable)
file_name: text
file_type: text ('audio' | 'pdf' | 'image')
file_url: text - Storage URL
description: text (nullable)
created_at: timestamp
```

#### `sermons` (Sermon notes for events)
```
id: uuid (primary key)
event_id: uuid (references events.id)
title: text
preacher: text
content: text
scripture_reference: text (nullable)
created_at: timestamp
updated_at: timestamp
```

#### `notifications` (App notifications)
```
id: uuid (primary key)
profile_id: uuid (references profiles.id)
type: text ('event_invite' | 'song_update' | 'team_change' | 'schedule_change')
title: text
message: text
is_read: boolean (default: false)
data: jsonb (nullable) - Additional context data
created_at: timestamp
```

---

## 5. Page Structure & Routes

### 5.1 Route Tree

```
/                           → Landing page (auth check)
/sign-in/[[...sign-up]]    → Clerk sign-in page
/sign-up/[[...sign-up]]    → Clerk sign-up page

/(dashboard)                → Protected dashboard layout
  /dashboard                → Home/Dashboard page
  /events                   → Events list
  /events/[id]              → Event detail page
  /songs                    → Songs library
  /songs/[id]               → Song detail page
  /calendar                 → Calendar view
  /team                     → Team directory
  /live/[id]                → Live presentation mode (fullscreen)

/api/...                    → API routes (see Section 7)
```

### 5.2 Navigation

**Bottom Navigation Bar (Mobile) - 4 items:**
- Events (CalendarDays icon) → `/events`
- Songs (Music icon) → `/songs`
- Calendar (Calendar icon) → `/calendar`
- Team (Users icon) → `/team`

**Header:** Fixed top header with:
- Menu button (hamburger)
- WorshipApp logo (links to /dashboard)
- User avatar

---

## 6. Detailed Page Specifications

### 6.1 Dashboard (`/dashboard`)

**Purpose:** Personal control center showing upcoming assignments.

**Components:**
- **Greeting Section:**
  - "Hola, [Full Name]" heading
  - "Bienvenido a WorshipApp" subtitle
  - Role badge if admin

- **Upcoming Events Section:**
  - Section title "Próximos Eventos" with "Ver todos" link to /events
  - Event cards showing:
    - Event icon (based on event_type)
    - Event title
    - Date and time
    - Location (if set)
  - Cards are clickable → navigate to `/events/[id]`

- **Quick Access Grid (2x2):**
  - Eventos card → `/events`
  - Canciones card → `/songs`
  - Calendario card → `/calendar`
  - Equipo card → `/team`

- **Notifications:** (future) Alerts for last-minute changes

**Mock Data Display:** Currently shows hardcoded demo data.

---

### 6.2 Events List (`/events`)

**Purpose:** List all upcoming and past events.

**Components:**
- **Header:** Title "Eventos" + "Nuevo" button (admin only)

- **Tabs:**
  - "Próximos (N)" - active tab
  - "Pasados (N)" - inactive

- **Event Cards (clickable → `/events/[id]`):**
  - Event type icon
  - Event title
  - Event type label
  - Date (formatted: "27 de Abril")
  - Time (if set)
  - Location (if set)
  - Song count indicator

**Event Type Icons:**
```
servicio_dominical: 📖
ensayo: 🎸
evento_especial: 🎉
servicio_jovenes: 🎵
otro: 📅
```

**Empty State:** When no events, show "No hay eventos próximos" message.

---

### 6.3 Event Detail (`/events/[id]`)

**Purpose:** Full event management view.

**Sections:**

1. **Header:**
   - Back button (→ `/events`)
   - Event title and type
   - Edit button (admin only)
   - Delete button (admin only)

2. **Event Info Bar:**
   - Date with CalendarDays icon
   - Time with Clock icon (start - end)
   - Location with MapPin icon
   - Description text

3. **Live Mode Control:**
   - Status indicator ("Modo En Vivo desactivado/activado")
   - "Activar Modo En Vivo" button → navigates to `/live/[id]`

4. **Setlist Section:**
   - Title "Setlist" with "+ Añadir" button
   - Drag-and-drop sortable song list (admin)
   - Each song card shows:
     - Order number (blue circle)
     - Song title
     - Artist
     - Key (custom or original in parentheses)
     - Expand arrow for chord preview (if chords exist)
     - Notes toggle (📝)
     - Delete button (admin only)
   - Empty state: "No hay canciones en el setlist"

5. **Team Section:**
   - Title "Equipo del Evento" with "+ Añadir" button
   - Team member cards showing:
     - Avatar (initials in blue circle)
     - Name
     - Role/instrument
   - Empty state: "No hay equipo asignado"

6. **Sermon Section:**
   - Title "Prédica" with "+ Crear" button
   - Sermon card showing:
     - Title
     - Preacher name
     - Scripture reference (highlighted)
     - Content preview

**URL Params:** `id` - Event UUID

---

### 6.4 Songs Library (`/songs`)

**Purpose:** Central database of all songs.

**Components:**
- **Header:** Title "Canciones" + "Nueva" button (admin only)

- **Search Bar:**
  - Search icon
  - Input placeholder: "Buscar canciones por título o artista..."
  - Filters for: key, tempo, tags (future)

- **Song Cards (clickable → `/songs/[id]`):**
  - Song title
  - Artist name
  - Key badge (e.g., "La")
  - Tempo (e.g., "72 BPM")
  - "Audio disponible" badge if has_audio

**Empty State:** "No hay canciones" with "Agregar primera canción" link

---

### 6.5 Song Detail (`/songs/[id]`)

**Purpose:** Full song management and viewing.

**Components:**

1. **Header:**
   - Back button (→ `/songs`)
   - Song title and artist
   - Edit button (admin only)
   - Delete button (admin only)

2. **Metadata Badges:**
   - Key badge (e.g., "La")
   - Tempo badge (e.g., "72 BPM")
   - Audio badge (if has_audio)

3. **Tags:** Horizontal list of tag badges

4. **Audio Player Section:** (if has_audio)
   - Title "Audio"
   - AudioPlayer component:
     - Play/Pause button (blue circle)
     - Track title
     - Progress bar (read-only)
     - Time display (current / total)
     - Volume toggle

5. **External Links:**
   - Spotify link button (if spotify_url)
   - YouTube link button (if youtube_url)

6. **Chords/Lyrics Section:**
   - Title "Cifrado" with "+ Añadir parte" button (admin)
   - Song parts list:
     - Part name (e.g., "Verso 1") in blue
     - Part content in monospace font
     - Edit/Remove buttons (admin only)
   - Chord notation format: `[La]`, `[Mi]`, etc. above lyrics

7. **Versions Section:**
   - Title "Versiones (N)" with "+ Nueva versión" button
   - Version pills (clickable):
     - Default version highlighted with blue border
     - Other versions in gray border
     - Active version shows blue background

8. **Notes Section:**
   - Title "Notas del Director"
   - Notes text in card

**URL Params:** `id` - Song UUID

---

### 6.6 Calendar (`/calendar`)

**Purpose:** Monthly calendar view of all events.

**Components:**
- **Header:** Title "Calendario"

- **Month Navigation:**
  - Previous arrow button
  - Current month/year label
  - Next arrow button

- **Calendar Grid:**
  - Weekday headers (Dom, Lun, Mar, Mié, Jue, Vie, Sáb)
  - 35-day grid (5 weeks)
  - Days with events highlighted (blue background tint)
  - Event indicator emoji on highlighted days

- **Selected Day Events:**
  - Title "Eventos de [Month]"
  - Event list below calendar

---

### 6.7 Team Directory (`/team`)

**Purpose:** Manage all team members.

**Components:**
- **Header:** Title "Equipo" + "Invitar" button (admin only)

- **Team Member Cards:**
  - Avatar (initials in blue circle)
  - Name
  - "Admin" badge (if role = admin)
  - Instrument/role
  - Email with Mail icon
  - Edit button

**User Roles Display:**
```
admin → Shows "Admin" badge in blue
participant → No badge
```

---

### 6.8 Live Mode (`/live/[id]`)

**Purpose:** Fullscreen presentation mode for live services.

**IMPORTANT:** This page is FULLSCREEN (fixed inset-0), z-index 100, blocks all editing.

**Components:**

1. **Top Bar (fixed):**
   - Exit button (✕) - navigates back
   - Event title
   - Live indicator (pulsing red dot + "En vivo" text)
   - Song counter (e.g., "2 / 5")
   - Previous/Next arrow buttons

2. **Content Area (scrollable):**
   - Song title (large, centered)
   - Artist name (gray)
   - Key indicator badge
   - Song parts with chords:
     - Part name in blue
     - Chords and lyrics in monospace, large font
     - Chord transposition applied visually

3. **Transposition Controls (fixed bottom):**
   - "-1" button
   - Transposition display ("Original" or "+2", "-1", etc.)
   - "+1" button
   - "Reset" button

**Controls:**
- **Keyboard:** Arrow Right/Space → next, Arrow Left → previous, Escape → exit
- **Touch:** Swipe left → next, Swipe right → previous
- **Screen Lock:** Keep screen awake (using wake lock API or similar)

**Read-Only Behavior:** All edit buttons HIDDEN/DISABLED in live mode.

**URL Params:** `id` - Event UUID

---

## 7. API Endpoints

### 7.1 Authentication

**Clerk Webhook:** `POST /api/webhooks/clerk`
- Handles: `user.created`, `user.updated`, `user.deleted`
- Syncs user data to `profiles` table
- Creates/updates/deactivates profiles based on Clerk events

### 7.2 Events API

**GET `/api/events`**
- Auth: Required
- Returns: Array of events with song count
- Query params: none (future: date range, type filter)

**POST `/api/events`**
- Auth: Admin only
- Body: `{ title, event_type, event_date, start_time, end_time, location, description, is_published }`
- Returns: Created event

**GET `/api/events/[id]`**
- Auth: Required (assigned team members or admin)
- Returns: Event with setlist songs, team, sermon

**PATCH `/api/events/[id]`**
- Auth: Admin only
- Body: Partial event update fields
- Returns: Updated event

**DELETE `/api/events/[id]`**
- Auth: Admin only
- Returns: 204 No Content

### 7.3 Event Songs (Setlist) API

**GET `/api/events/[id]/songs`**
- Auth: Required
- Returns: Array of event_songs with song details, parts, and files

**POST `/api/events/[id]/songs`**
- Auth: Admin only
- Body: `{ song_id, custom_key?, director_notes? }`
- Returns: Created event_song

**PATCH `/api/events/[id]/songs`**
- Auth: Admin only
- Body: `{ eventSongId, custom_key?, director_notes?, order_index? }`
- Returns: Updated event_song

**DELETE `/api/events/[id]/songs?eventSongId=xxx`**
- Auth: Admin only
- Returns: 204 No Content

### 7.4 Event Team API

**GET `/api/events/[id]/team`**
- Auth: Required
- Returns: Array of event_team assignments with profile details

**POST `/api/events/[id]/team`**
- Auth: Admin only
- Body: `{ profile_id, role_type, status?, notes? }`
- Returns: Created event_team

**PATCH `/api/events/[id]/team`**
- Auth: Required
- Body: `{ eventTeamId, status? }`
- Returns: Updated event_team

**DELETE `/api/events/[id]/team?eventTeamId=xxx`**
- Auth: Admin only
- Returns: 204 No Content

### 7.5 Songs API

**GET `/api/songs`**
- Auth: Required
- Query params: `search`, `key`, `tags[]`
- Returns: Array of songs with parts and files

**POST `/api/songs`**
- Auth: Admin only
- Body: `{ title, artist, original_key, tempo?, tags?, notes?, spotify_url?, youtube_url?, parts? }`
- Returns: Created song (with parts if provided)

**GET `/api/songs/[id]`**
- Auth: Required
- Returns: Song with parts, versions, and files

**PATCH `/api/songs/[id]`**
- Auth: Admin only
- Body: Partial song update fields
- Returns: Updated song

**DELETE `/api/songs/[id]`**
- Auth: Admin only
- Returns: 204 No Content

### 7.6 Song Versions API

**GET `/api/songs/[id]/versions`**
- Auth: Required
- Returns: Array of song_versions

**POST `/api/songs/[id]/versions`**
- Auth: Admin only
- Body: `{ name, is_default? }`
- Returns: Created song_version

**GET `/api/songs/[id]/versions/[versionId]`**
- Auth: Required
- Returns: Version with its parts

**PATCH `/api/songs/[id]/versions/[versionId]`**
- Auth: Admin only
- Body: `{ name?, is_default? }`
- Returns: Updated song_version

**DELETE `/api/songs/[id]/versions/[versionId]`**
- Auth: Admin only
- Returns: 204 No Content

### 7.7 Team API

**GET `/api/team`**
- Auth: Required
- Returns: Array of active profiles

**GET `/api/team/[id]`**
- Auth: Required
- Returns: Profile details

**PATCH `/api/team/[id]`**
- Auth: Admin or self
- Body: `{ full_name?, instrument?, phone?, role? }`
- Returns: Updated profile

### 7.8 Notifications API

**POST `/api/notifications/invite`**
- Auth: Admin only
- Body: `{ email, role? }`
- Action: Sends invitation email via Resend
- Returns: `{ success: true }`

**POST `/api/notifications/event`**
- Auth: Required
- Body: `{ event_id, type, message }`
- Action: Creates notification for team members
- Returns: Created notifications

### 7.9 Settings API

**GET `/api/settings`**
- Auth: Required
- Returns: User settings/preferences

**PATCH `/api/settings`**
- Auth: Required
- Body: `{ theme?, notifications_enabled?, default_key? }`
- Returns: Updated settings

### 7.10 Upload API

**POST `/api/upload`**
- Auth: Admin only
- Body: FormData with file and metadata
- Action: Uploads file to Supabase Storage
- Returns: `{ file_url, file_name, file_type }`

### 7.11 Live Mode API

**GET `/api/events/[id]/live`**
- Auth: Required (event team or admin)
- Returns: Event in live-mode ready format (optimized for presentation)

**PATCH `/api/events/[id]/live`**
- Auth: Admin only
- Body: `{ is_live: boolean }`
- Action: Toggles live mode state
- Returns: Updated event

### 7.12 Sermons API

**GET `/api/events/[id]/sermons`**
- Auth: Required
- Returns: Sermon for event (if exists)

**POST `/api/events/[id]/sermons`**
- Auth: Admin only
- Body: `{ title, preacher, content, scripture_reference? }`
- Returns: Created sermon

**PATCH `/api/events/[id]/sermons`**
- Auth: Admin only
- Body: `{ sermonId, title?, preacher?, content?, scripture_reference? }`
- Returns: Updated sermon

### 7.13 ChartPro API

**GET `/api/songs/[id]/chart-pro`**
- Auth: Required
- Returns: Array of ChartPro charts for song

**POST `/api/songs/[id]/chart-pro`**
- Auth: Admin only
- Body: `{ part_id?, version_id?, content, original_key?, tempo? }`
- Note: Either part_id OR version_id must be set (not both)
- Returns: Created chart

### 7.14 Audio Tracks API

**GET `/api/songs/[id]/audio`**
- Auth: Required
- Returns: Array of audio tracks for song

**POST `/api/songs/[id]/audio`**
- Auth: Admin only
- Body: `{ file_name, file_url, file_type, instrument?, stem_type?, file_size?, duration? }`
- Returns: Created audio track

### 7.15 Notifications API

**GET `/api/notifications`**
- Auth: Required
- Returns: Array of notifications for current user

**POST `/api/notifications`**
- Auth: Admin only
- Body: `{ profile_id, type, title, message, data? }`
- Returns: Created notification

---

## 8. Component Library

### 8.1 UI Components (`/src/components/ui/index.tsx`)

Currently includes:
- Button (variants: default, ghost, outline; sizes: sm, md)
- Badge (variants: default, outline)
- Input
- Card
- Dialog (modal)

### 8.2 Custom Components

| Component | Location | Description |
|-----------|----------|-------------|
| AudioPlayer | `/src/components/audio-player.tsx` | Audio playback with play/pause, progress, volume |
| SetlistClient | `/src/components/setlist-client.tsx` | Drag-and-drop setlist with sortable items |
| LiveModeClient | `/src/components/live-mode-client.tsx` | Fullscreen live presentation mode |
| DemoAuthContext | `/src/components/demo-auth-context.tsx` | Demo authentication context provider |
| Providers | `/src/components/providers.tsx` | App-level providers wrapper |

---

## 9. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Current Implementation Status

### Completed (MVP):
- ✅ Basic page structure and routing
- ✅ Authentication setup (Clerk)
- ✅ Database schema design (Supabase)
- ✅ Webhook handler for user sync
- ✅ Live mode basic implementation
- ✅ Drag-and-drop setlist (UI only)
- ✅ Audio player component
- ✅ Mobile-first navigation

### In Progress / Not Implemented:
- ⏳ Real Supabase data fetching (currently using mock data)
- ⏳ Full CRUD operations for all entities
- ⏳ Song transposition logic
- ⏳ File upload to Supabase Storage
- ⏳ Email sending with Resend (invitation flow)
- ⏳ Real-time notifications
- ⏳ Event templates
- ⏳ Spotify/YouTube integration
- ⏳ Multitrack player with stems
- ⏳ PDF processing for sheet music
- ⏳ Clean lyrics view for multimedia
- ⏳ User attendance confirmation
- ⏳ Search and filters for songs
- ⏳ Calendar interactions
- ⏳ Role-based access control implementation

---

## 11. Design System

### 11.1 Color Palette (Dark Theme)

| Purpose | Color | CSS Value |
|---------|-------|-----------|
| Background | Black | `hsl(0,0%,0%)` |
| Card Background | Dark Gray | `hsl(0,0%,7%)` |
| Border | Medium Gray | `hsl(0,0%,20%)` |
| Text Primary | White | `hsl(0,0%,100%)` |
| Text Secondary | Light Gray | `hsl(0,0%,65%)` |
| Text Muted | Gray | `hsl(0,0%,45%)` |
| Accent (Primary) | Blue | `hsl(217,91%,60%)` |
| Live/Alert | Red | `hsl(0,100%,50%)` |
| Error | Red | `hsl(0,100%,50%)` |

### 11.2 Typography

- **Headings:** Font bold, white
- **Body:** Font regular, white or gray
- **Monospace:** For chord/lyric display
- **Font Stack:** System fonts

### 11.3 Spacing

- Base unit: 4px
- Padding: 4, 8, 12, 16, 20, 24px
- Border radius: 8px (cards), 12px (buttons)

### 11.4 Component States

| State | Visual |
|-------|--------|
| Default | Border `hsl(0,0%,20%)` |
| Hover | Border `hsl(217,91%,60%)` (blue) |
| Active | Background `hsl(217,91%,60%)/10` |
| Disabled | Opacity 50% |
| Loading | Spinner animation |

---

## 12. Business Rules

### 12.1 Event Types

```
servicio_dominical: Regular Sunday service
ensayo: Rehearsal
evento_especial: Special event
servicio_jovenes: Youth service
otro: Other/custom
```

### 12.2 Event Song Assignment Rules

- Only admin can add/remove songs from setlist
- Custom key overrides song's original key for that event only
- Director notes are per-event, not per-song
- Order index determines setlist position (drag to reorder)

### 12.3 Song Version Rules

- Default version is shown when viewing song
- Creating a new version duplicates all parts
- Versions can have different part structures
- Only admin can create/delete versions

### 12.4 Transposition Rules

- Transposition applies to entire song
- Range: -12 to +12 semitones
- Visual transposition (not modifying stored data)
- Reset returns to original key

### 12.5 Live Mode Rules

- Only event team members or admin can enter live mode
- All editing is disabled in live mode
- Screen stays awake during live mode
- Swipe/keyboard navigation follows order_index
- Live mode state is stored in `events.is_live`

### 12.6 Notification Triggers

- Event created → Team members receive notification
- Song updated → Team members receive notification
- Team member added/removed from event → Affected member notified
- Event date/time changed → All assigned members notified

---

## 13. File Structure

```
/src
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── songs/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── team/page.tsx
│   │   ├── live/[id]/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── events/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── songs/route.ts
│   │   │       ├── team/route.ts
│   │   │       ├── live/route.ts
│   │   │       └── sermons/route.ts
│   │   ├── songs/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── versions/
│   │   │           ├── route.ts
│   │   │           └── [versionId]/route.ts
│   │   ├── team/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── notifications/
│   │   │   ├── invite/route.ts
│   │   │   └── event/route.ts
│   │   ├── upload/route.ts
│   │   ├── settings/route.ts
│   │   └── webhooks/clerk/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/index.tsx
│   ├── audio-player.tsx
│   ├── setlist-client.tsx
│   ├── live-mode-client.tsx
│   ├── demo-auth-context.tsx
│   └── providers.tsx
└── lib/
    ├── supabase.ts
    └── utils.ts
```

---

## 14. Important Notes for Agents

1. **Next.js App Router:** This project uses Next.js App Router (not Pages Router). All components in `app/` are Server Components by default unless marked with `"use client"`.

2. **Route Params:** Use React Server Components with `params` as Promise:
   ```tsx
   export default function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```

3. **Clerk Auth:** Use `auth()` from `@clerk/nextjs/server` for server-side auth checks.

4. **Supabase:** Use `createServerClient()` for server-side operations, `createServiceClient()` for admin operations (webhooks).

5. **Styling:** Use Tailwind CSS classes with `hsl()` values matching the design system colors. Dark theme by default.

6. **Mobile-First:** All UI should be optimized for mobile (375px-428px width) with desktop fallback.

7. **TypeScript:** Strict typing required. No `any` types.

8. **No Console Logs:** Remove all `console.log` statements before committing.

---

*Last Updated: 2026-05-07*