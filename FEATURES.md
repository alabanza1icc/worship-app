# WorshipApp - Complete Feature Specifications

## 1. Overview

This document details every feature, user interaction, button, and functionality of the WorshipApp platform. It serves as a comprehensive reference for any developer working on this project.

---

## 2. Feature Modules

### 2.1 Authentication Module

#### Features:
- **Sign In:** Clerk-hosted sign-in page at `/sign-in`
- **Sign Up:** Clerk-hosted sign-up page at `/sign-up`
- **Session Management:** Automatic session handling via Clerk
- **User Sync:** Automatic profile creation/update via Clerk webhook
- **Sign Out:** Clerk sign-out functionality

#### User Interactions:
- Click "Sign In" → Redirect to Clerk hosted UI → Return to app
- Click "Sign Up" → Redirect to Clerk hosted UI → Return to app
- User created in Clerk → Webhook creates profile in Supabase

#### Edge Cases:
- Invalid credentials → Clerk shows error
- User already exists → Clerk handles merge
- Webhook fails → Log error, retry later

---

### 2.2 Dashboard Module

#### Features:
- **Greeting Section:** Personalized welcome with user name
- **Upcoming Events:** Cards showing next 3 events user is assigned to
- **Quick Access Grid:** 2x2 grid with links to main sections
- **Notifications Preview:** (Future) Alert badges for changes

#### User Interactions:
- View greeting with name and role badge
- Click event card → Navigate to `/events/[id]`
- Click "Ver todos" → Navigate to `/events`
- Click quick access cards → Navigate to respective pages

#### Data Displayed:
- User's full name
- User's role (if admin shows badge)
- Next events with: title, date/time, location, type icon
- Quick links: Eventos, Canciones, Calendario, Equipo

---

### 2.3 Events Module

#### 2.3.1 Events List (`/events`)

**Features:**
- List all events (upcoming/past tabs)
- Create new event button (admin only)
- Search/filter by type (future)
- Event cards with metadata

**User Interactions:**
- Click tabs to switch upcoming/past
- Click "Nuevo" → Open create event modal/page (admin only)
- Click event card → Navigate to `/events/[id]`
- Swipe on card (mobile) → Show quick actions (future)

**UI Elements:**
- Tab bar: "Próximos (N)" | "Pasados (N)"
- "Nuevo" button (admin only, blue)
- Event cards with: icon, title, type label, date, time, location, song count

**Event Type Icons:**
| Type | Icon | Label |
|------|------|-------|
| servicio_dominical | 📖 | Servicio Dominical |
| ensayo | 🎸 | Ensayo |
| evento_especial | 🎉 | Evento Especial |
| servicio_jovenes | 🎵 | Servicio de Jovenes |
| otro | 📅 | Otro |

**Empty State:**
- "No hay eventos próximos" message
- "Agregar primer evento" link (admin only)

---

#### 2.3.2 Event Detail (`/events/[id]`)

**Features:**
- Full event information display
- Setlist management (add/remove/reorder songs)
- Team assignment management
- Sermon notes
- Live mode activation

**User Interactions:**

*Header Actions:*
- Click back arrow → Return to `/events`
- Click edit icon → Open edit modal (admin only)
- Click delete icon → Confirm delete dialog (admin only)

*Live Mode:*
- Click "Activar Modo En Vivo" → Navigate to `/live/[id]`
- Button shows current live status

*Setlist Section:*
- Click "+ Añadir" → Open song picker modal (admin only)
- Drag song card → Reorder (admin only, dnd-kit)
- Click expand arrow → Show chord preview
- Click 📝 → Toggle notes panel
- Click delete icon → Remove song from setlist (admin only)

*Team Section:*
- Click "+ Añadir" → Open team member picker (admin only)
- Click team card → View member details (future)

*Sermon Section:*
- Click "+ Crear" → Open sermon form (admin only)
- Click sermon card → Expand full content

**UI Elements:**
- Header: title, type badge, edit/delete buttons
- Info bar: date, time, location icons with values
- Live mode toggle button
- Setlist section with sortable items
- Team section with member cards
- Sermon section with expandable card

**Edge Cases:**
- No songs in setlist → Show empty state with add button
- No team assigned → Show empty state with add button
- No sermon → Show empty state with create button

---

#### 2.3.3 Create/Edit Event

**Features:**
- Form to create or edit event
- Fields: title, type, date, time, location, description
- Event type selector
- Publish toggle

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | text | Yes | 1-100 chars |
| event_type | select | Yes | One of event types |
| event_date | date | Yes | Valid date |
| start_time | time | No | Valid time |
| end_time | time | No | Valid time, after start |
| location | text | No | 0-200 chars |
| description | textarea | No | 0-1000 chars |
| is_published | checkbox | No | Default false |

**User Interactions:**
- Fill form → Validate → Submit → Create/Update event
- Click cancel → Discard and close

---

### 2.4 Songs Module

#### 2.4.1 Songs Library (`/songs`)

**Features:**
- List all active songs
- Search by title or artist
- Filter by key, tempo, tags (future)
- Create new song button (admin only)

**User Interactions:**
- Type in search → Filter songs in real-time
- Click "Nueva" → Navigate to create song page (admin only)
- Click song card → Navigate to `/songs/[id]`

**UI Elements:**
- Search input with icon
- Song cards: title, artist, key badge, tempo, audio indicator

**Empty State:**
- "No hay canciones" message
- "Agregar primera canción" link (admin only)

---

#### 2.4.2 Song Detail (`/songs/[id]`)

**Features:**
- Song metadata display
- Lyrics with chord notation
- Audio player for multitracks
- External links (Spotify, YouTube)
- Version management
- Director notes
- CRUD operations (admin only)

**User Interactions:**

*Header:*
- Click back → Return to `/songs`
- Click edit → Open edit mode (admin only)
- Click delete → Confirm delete dialog (admin only)

*Metadata:*
- View key badge (e.g., "La")
- View tempo badge (e.g., "72 BPM")
- View tags as pills

*Audio Player:*
- Click play/pause → Toggle audio playback
- Drag progress bar → Seek (display only in MVP)
- Click volume → Toggle mute
- Shows: title, current time / total time

*External Links:*
- Click Spotify icon → Open Spotify URL in new tab
- Click YouTube icon → Open YouTube URL in new tab

*Cifrado Section:*
- View list of parts (Verso, Coro, Puente, etc.)
- Each part shows: name in blue, content in monospace
- Click "Añadir parte" → Add new part form (admin only)
- Click "Editar" on part → Edit part content (admin only)
- Click "Eliminar" on part → Remove part (admin only)

*Versions Section:*
- View version pills (horizontal scroll)
- Click version pill → Switch to that version
- Active version: blue border and background
- Default version: marked with blue border
- Click "Nueva versión" → Create version modal (admin only)

*Notes Section:*
- View director notes in card
- Edit notes inline (admin only)

**Chord Notation Format:**
```
[La]Cantaré de Tu bondad
[Mi]Esperaré en Ti
[La]Mi corazón encuentra
[Mi]Paz en Tu presencia
```

---

#### 2.4.3 Create/Edit Song

**Features:**
- Full song creation form
- Part editor with chord notation
- Tag management
- URL fields for Spotify/YouTube

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | text | Yes | 1-200 chars |
| artist | text | Yes | 1-200 chars |
| original_key | select | Yes | Musical key (Do-Re-Si) |
| tempo | number | No | 20-300 BPM |
| tags | multi-select | No | Predefined tags |
| notes | textarea | No | Director notes |
| spotify_url | url | No | Valid Spotify URL |
| youtube_url | url | No | Valid YouTube URL |

**Part Editor:**
- Add part: name + content textarea
- Parts can be reordered
- Chord notation auto-detected for display

---

### 2.5 Setlist Management

#### Features:
- Drag-and-drop reordering
- Custom key per event
- Director notes per event song
- Add/remove songs from setlist

**Components:**
- `SetlistClient` component in `/src/components/setlist-client.tsx`
- Uses `@dnd-kit/core` for drag-and-drop
- Uses `@dnd-kit/sortable` for list items

**User Interactions:**
- Drag handle → Drag to reorder
- Drop → Save new order to API
- Click notes icon → Toggle notes textarea
- Type in notes → Auto-save on blur
- Click key badge → Edit custom key
- Click delete → Remove song

**API Operations:**
```typescript
// Reorder
PATCH /api/events/[id]/songs
{ eventSongId: "uuid", order_index: 2 }

// Update notes
PATCH /api/events/[id]/songs
{ eventSongId: "uuid", director_notes: "notes" }

// Update key
PATCH /api/events/[id]/songs
{ eventSongId: "uuid", custom_key: "Re" }

// Remove
DELETE /api/events/[id]/songs?eventSongId=uuid
```

---

### 2.6 Live Mode Module

#### Features (`/live/[id]`):
- Fullscreen presentation view
- Song-by-song navigation
- Chord transposition
- Screen wake lock
- Keyboard/touch controls

**User Interactions:**

*Navigation:*
- Click → arrow → Next song
- Click ← arrow → Previous song
- Swipe left → Next song
- Swipe right → Previous song
- Press Space → Next song
- Press Arrow keys → Navigate
- Press Escape → Exit live mode

*Transposition:*
- Click +1 → Transpose up one semitone
- Click -1 → Transpose down one semitone
- Click Reset → Return to original key

*Exit:*
- Click ✕ → Return to event detail
- Press Escape → Return to event detail

**Transposition Logic:**
```
Keys: Do, Do#, Re, Re#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si
Range: -12 to +12 semitones
Display: "Original" for 0, "+N" for positive, "N" for negative
```

**UI Elements:**
- Top bar: Exit button, event title, live indicator, song counter, nav arrows
- Content: Song title, artist, key badge, parts with chords
- Bottom bar: Transpose controls (-1, display, +1, Reset)

**State:**
- `currentIndex` - Current song position
- `transposition` - Current transpose value (-12 to +12)
- `setlist` - Array of songs from event

---

### 2.7 Calendar Module

#### Features:
- Monthly calendar grid view
- Event indicators on dates
- Navigate between months
- List events for selected day

**User Interactions:**
- Click ← → Navigate previous/next month
- Click on date → Show events for that date
- Days with events highlighted in blue

**UI Elements:**
- Month/year header
- Weekday labels (Dom-Sáb)
- 35-day grid (5 weeks)
- Event pills on dates
- Event list below calendar

**Data Displayed:**
- Current month and year
- Events per day (max 3 shown, then "+N")
- Click date → Show all events for that date

---

### 2.8 Team Module

#### Features:
- List all team members
- View member profiles
- Invite new members (admin only)
- Edit member profile (admin/self)

**User Interactions:**
- Click "Invitar" → Open invite modal (admin only)
- Click member card → View details (future)
- Click edit icon → Edit member profile (admin/self)

**UI Elements:**
- Member cards with avatar, name, role badge, instrument, email
- Admin badge in blue for admin role
- Edit button on each card

**Invite Flow:**
1. Admin clicks "Invitar"
2. Modal opens with email input and role selector
3. Submit → API sends invitation email via Resend
4. User receives email with sign-up link

---

### 2.9 Audio Player Component

#### Features:
- Play/pause audio
- Progress bar (read-only in MVP)
- Time display (current / total)
- Volume control
- Mute toggle

**Component:** `/src/components/audio-player.tsx`

**Props:**
```typescript
interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}
```

**User Interactions:**
- Click play/pause → Toggle playback
- Drag progress → Seek (future)
- Click volume icon → Toggle mute
- Volume slider → Adjust volume (future)

**States:**
- Loading: Spinner while audio loads
- Playing: Pause icon shown
- Paused: Play icon shown
- Error: "Error loading audio" message

---

### 2.10 Notifications Module

#### Features (Future):
- In-app notification bell
- Notification list
- Mark as read
- Notification types: event_invite, song_update, team_change, schedule_change

**API Endpoints:**
- GET `/api/notifications` - List user notifications
- PATCH `/api/notifications/[id]` - Mark as read
- POST `/api/notifications/event` - Create event notification

---

### 2.11 Settings Module

#### Features (Future):
- User preferences
- Default key preference
- Notification settings
- Theme selection

**API Endpoints:**
- GET `/api/settings` - Get user settings
- PATCH `/api/settings` - Update settings

---

## 3. Button Specifications

### 3.1 Global Buttons

| Button | Variant | Size | Icon | Visibility |
|--------|---------|------|------|-----------|
| "Nuevo" | default | sm | Plus | Admin only |
| "Invitar" | default | sm | Plus | Admin only |
| "Nueva" | default | sm | Plus | Admin only |
| "Guardar" | default | sm | None | Admin only |
| "Cancelar" | ghost | sm | None | All |
| "Eliminar" | ghost | sm | Trash2 | Admin only |
| "Editar" | ghost | sm | Edit | Admin only |

### 3.2 Setlist Buttons

| Button | Icon | Action | Visibility |
|--------|------|--------|------------|
| Drag handle | GripVertical | Drag to reorder | Admin only |
| Expand | ChevronDown/Up | Show/hide chords | All |
| Notes | 📝 | Toggle notes | All |
| Delete | Trash2 | Remove from setlist | Admin only |
| Add song | Plus | Open song picker | Admin only |

### 3.3 Live Mode Buttons

| Button | Icon | Action |
|--------|------|--------|
| Exit | ✕ | Close live mode |
| Previous | ← | Previous song |
| Next | → | Next song |
| Transpose - | -1 | Decrease key |
| Transpose + | +1 | Increase key |
| Reset | Reset | Return to original |

### 3.4 Audio Player Buttons

| Button | Icon | Action |
|--------|------|--------|
| Play/Pause | Play/Pause | Toggle playback |
| Volume | Volume2/VolumeX | Toggle mute |

---

## 4. Form Specifications

### 4.1 Event Form

```typescript
interface EventForm {
  title: string;
  event_type: 'servicio_dominical' | 'ensayo' | 'evento_especial' | 'servicio_jovenes' | 'otro';
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time?: string; // HH:MM
  location?: string;
  description?: string;
  is_published: boolean;
}
```

### 4.2 Song Form

```typescript
interface SongForm {
  title: string;
  artist: string;
  original_key: string;
  tempo?: number;
  tags?: string[];
  notes?: string;
  spotify_url?: string;
  youtube_url?: string;
}
```

### 4.3 Song Part Form

```typescript
interface SongPartForm {
  name: string; // e.g., "Verso 1", "Coro", "Puente"
  content: string; // Lyrics with chord notation
}
```

### 4.4 Team Invite Form

```typescript
interface InviteForm {
  email: string;
  role?: 'participant' | 'musician' | 'multimedia';
}
```

### 4.5 Event Team Form

```typescript
interface EventTeamForm {
  profile_id: string;
  role_type: 'lead_singer' | 'background_vocals' | 'guitar' | 'bass' | 'drums' | 'piano' | 'keys' | 'multimedia' | 'dance';
  status?: 'confirmed' | 'pending' | 'declined';
  notes?: string;
}
```

---

## 5. Validation Rules

### 5.1 Event Validation
- title: required, 1-100 characters
- event_type: required, must be valid type
- event_date: required, must be valid date
- start_time: optional, must be valid time
- end_time: optional, must be after start_time
- location: optional, max 200 characters
- description: optional, max 1000 characters

### 5.2 Song Validation
- title: required, 1-200 characters
- artist: required, 1-200 characters
- original_key: required, must be valid key
- tempo: optional, 20-300 BPM
- tags: optional, array of strings
- spotify_url: optional, must be valid URL
- youtube_url: optional, must be valid URL

### 5.3 Song Part Validation
- name: required, 1-50 characters
- content: required, max 10000 characters

### 5.4 Team Validation
- email: required, must be valid email format
- role: optional, default 'participant'

### 5.5 Event Team Validation
- profile_id: required, must exist in profiles
- role_type: required, must be valid role
- status: optional, default 'pending'

---

## 6. Error Handling

### 6.1 API Errors

| Status | Error | User Message |
|--------|-------|--------------|
| 400 | Bad Request | "Datos inválidos" |
| 401 | Unauthorized | "Debes iniciar sesión" |
| 403 | Forbidden | "No tienes permisos" |
| 404 | Not Found | "No encontrado" |
| 500 | Server Error | "Error del servidor" |

### 6.2 Form Errors

- Display under each field
- Red text color
- Icon indicator

### 6.3 Empty States

| Page | Message | Action |
|------|---------|--------|
| Events | "No hay eventos próximos" | "Agregar primer evento" (admin) |
| Songs | "No hay canciones" | "Agregar primera canción" (admin) |
| Setlist | "No hay canciones en el setlist" | "Añadir primera canción" (admin) |
| Team | "No hay miembros en el equipo" | "Invitar primer miembro" (admin) |
| Sermon | "No hay prédica" | "Crear prédica" (admin) |

---

## 7. Future Features

### 7.1 In Progress
- [ ] Real Supabase data fetching
- [ ] Full CRUD operations
- [ ] Song transposition logic
- [ ] File upload to Supabase Storage

### 7.2 Planned
- [ ] PDF processing for sheet music
- [ ] Multitrack player with stems
- [ ] Clean lyrics view for multimedia
- [ ] User attendance confirmation
- [ ] Real-time notifications
- [ ] Event templates
- [ ] Spotify/YouTube integration
- [ ] Search and filters for songs
- [ ] Calendar interactions
- [ ] Role-based access control

### 7.3 Nice to Have
- [ ] Dark/Light theme toggle
- [ ] Offline mode
- [ ] Mobile app (React Native)
- [ ] Apple Watch app
- [ ] Setlist sharing
- [ ] Performance analytics

---

*Last Updated: 2026-05-07*