# WorshipApp - Technical Architecture

## 1. System Overview

WorshipApp es una plataforma SaaS multi-tenant diseñada para gestionar equipos de alabanza en iglesias. El sistema está construido con una arquitectura moderna full-stack usando Next.js 16 App Router.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Clerk     │  │  Next.js    │  │    React 19            │  │
│  │   Auth      │  │  16 App     │  │    (Client Components) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   REST API    │
                    │   (Next.js)   │
                    └───────┬───────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         BACKEND                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Supabase   │  │  Resend     │  │    Svix                │  │
│  │  Postgres   │  │  Email      │  │    Webhooks            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Architecture

### 2.1 Clerk Integration

**Provider Setup:**
- Uses `@clerk/nextjs` for authentication
- Middleware at `middleware.ts` (future) protects `/dashboard` routes
- `auth()` from `@clerk/nextjs/server` for server-side auth checks

**Flow de Autenticación:**
```
1. User visits /sign-in or /sign-up
2. Clerk renders hosted authentication UI
3. After successful auth, Clerk sets session cookie
4. User redirected to /dashboard
5. All API routes call auth() to verify session
6. User ID (Clerk) is used as foreign key in profiles table
```

### 2.2 User Sync (Clerk → Supabase)

**Webhook Endpoint:** `POST /api/webhooks/clerk`

**Event Types Handled:**
- `user.created` → Create new profile in Supabase
- `user.updated` → Update profile in Supabase
- `user.deleted` → Set is_active = false (soft delete)

**Svix Verification:**
```typescript
const wh = new Webhook(CLERK_WEBHOOK_SECRET);
const event = wh.verify(payload, headers);
```

---

## 3. Database Architecture

### 3.1 Supabase Client Strategy

**Three Client Types:**

1. **`supabase` (anon client):**
   - Used in Client Components
   - Respects RLS policies
   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **`createServerClient()`:**
   - Used in Server Components and API routes
   - Creates new client per request (no persistence)
   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **`createServiceClient()`:**
   - Used in webhooks and admin operations
   - Bypasses RLS using service role key
   - Uses `SUPABASE_SERVICE_ROLE_KEY`

### 3.2 Row Level Security (RLS)

**profiles table:**
- Users can read their own profile
- Users can update their own profile (except role)
- Only admin can update other profiles

**events table:**
- Authenticated users can read published events
- Admin can create/update/delete events
- Event team members can read their assigned events

**songs table:**
- All authenticated users can read active songs
- Only admin can create/update/delete songs

### 3.3 Database Indexes

Recommended indexes:
```sql
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_team ON event_team(event_id, profile_id);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_song_parts_song ON song_parts(song_id);
CREATE INDEX idx_event_songs_event ON event_songs(event_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

---

## 4. API Architecture

### 4.1 API Design Patterns

**Base URL:** `/api`

**Standard Response Format:**
```typescript
// Success
NextResponse.json(data, { status: 200 })

// Created
NextResponse.json(data, { status: 201 })

// Error
NextResponse.json({ error: "message" }, { status: 400 })
```

**Authentication Pattern:**
```typescript
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... proceed with request
}
```

**Admin-Only Pattern:**
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userId)
  .single();

if (profile?.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 4.2 API Routes Detail

#### Events API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Required | List all events |
| POST | `/api/events` | Admin | Create event |
| GET | `/api/events/[id]` | Required | Get event details |
| PATCH | `/api/events/[id]` | Admin | Update event |
| DELETE | `/api/events/[id]` | Admin | Delete event |

#### Event Songs API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/[id]/songs` | Required | Get setlist |
| POST | `/api/events/[id]/songs` | Admin | Add song to setlist |
| PATCH | `/api/events/[id]/songs` | Admin | Update setlist item |
| DELETE | `/api/events/[id]/songs` | Admin | Remove from setlist |

#### Event Team API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/[id]/team` | Required | Get team |
| POST | `/api/events/[id]/team` | Admin | Add team member |
| PATCH | `/api/events/[id]/team` | Required | Update status |
| DELETE | `/api/events/[id]/team` | Admin | Remove team member |

#### Songs API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/songs` | Required | List songs |
| POST | `/api/songs` | Admin | Create song |
| GET | `/api/songs/[id]` | Required | Get song details |
| PATCH | `/api/songs/[id]` | Admin | Update song |
| DELETE | `/api/songs/[id]` | Admin | Delete song |

#### Song Versions API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/songs/[id]/versions` | Required | List versions |
| POST | `/api/songs/[id]/versions` | Admin | Create version |
| GET | `/api/songs/[id]/versions/[versionId]` | Required | Get version |
| PATCH | `/api/songs/[id]/versions/[versionId]` | Admin | Update version |
| DELETE | `/api/songs/[id]/versions/[versionId]` | Admin | Delete version |

#### Team API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/team` | Required | List team |
| GET | `/api/team/[id]` | Required | Get member |
| PATCH | `/api/team/[id]` | Admin/self | Update member |

#### Notifications API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/notifications/invite` | Admin | Send invite email |
| POST | `/api/notifications/event` | Required | Create notification |

#### Other APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/PATCH | `/api/settings` | Required | User settings |
| POST | `/api/upload` | Admin | Upload file |
| GET/PATCH | `/api/events/[id]/live` | Required/Admin | Live mode |
| GET/POST/PATCH | `/api/events/[id]/sermons` | Required/Admin | Sermons |

---

## 5. File Upload Architecture

### 5.1 Supabase Storage

**Bucket Structure:**
```
worshipapp-bucket/
├── audio/
│   └── [song_id]/
│       ├── track.mp3
│       └── stems/
│           ├── drums.wav
│           ├── bass.wav
│           └── ...
├── pdfs/
│   └── [song_id]/
│       └── sheet_music.pdf
└── images/
    └── [song_id]/
        └── cover.jpg
```

### 5.2 Upload Flow

```typescript
// POST /api/upload
1. Verify admin auth
2. Parse FormData (file, song_id?, event_id?, description?)
3. Generate unique filename: `${uuid}-${originalname}`
4. Upload to Supabase Storage:
   await supabase.storage.from('bucket').upload(path, buffer)
5. Get public URL:
   const { data } = supabase.storage.from('bucket').getPublicUrl(path)
6. Create file record in database
7. Return { file_url, file_name, file_type }
```

---

## 6. Email Architecture

### 6.1 Resend Integration

**Provider Setup:**
- Uses `resend` npm package
- API key in `RESEND_API_KEY` env var
- From address: `WorshipApp <noreply@worshipapp.com>`

### 6.2 Email Templates

**Invitation Email:**
- Subject: "Invitación a WorshipApp"
- Contains inviter name
- CTA button to sign-up page
- HTML template with dark theme styling

---

## 7. Live Mode Architecture

### 7.1 State Management

**Event is_live flag:**
```typescript
// Toggles live mode
PATCH /api/events/[id]/live
Body: { is_live: boolean }
```

### 7.2 Client-Side Features

**Screen Wake Lock:**
```typescript
// Keep screen awake
navigator.wakeLock.request('screen')
```

**Keyboard Controls:**
- ArrowRight / Space → Next song
- ArrowLeft → Previous song
- Escape → Exit live mode

**Touch Controls:**
- Swipe left → Next song
- Swipe right → Previous song

### 7.3 Transposition Logic

```typescript
const KEYS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

function transpose(chord: string, semitones: number): string {
  // Parse chord (e.g., "La", "Mi", "Sol#")
  // Find index in KEYS array
  // Add semitones (clamped -12 to +12)
  // Return new chord
}
```

---

## 8. Real-Time Architecture (Future)

### 8.1 Supabase Realtime

**Subscriptions:**
- `profiles` table → Team member updates
- `events` table → Event changes
- `event_songs` table → Setlist updates

### 8.2 Implementation Pattern

```typescript
// Client Component
const channel = supabase
  .channel('event-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'event_songs', filter: `event_id=eq.${eventId}` },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe()
```

---

## 9. Security Architecture

### 9.1 Authentication Security

- Clerk handles all authentication
- Session cookies are HTTP-only
- Webhook signatures verified with Svix

### 9.2 API Security

- All API routes require authentication (except webhooks)
- Admin-only routes check profile role
- RLS policies in Supabase for additional protection

### 9.3 Data Validation

- Zod schemas for request body validation (future)
- TypeScript strict mode enabled
- No `any` types allowed

---

## 10. Deployment Architecture

### 10.1 Vercel Deployment

**Build Command:** `npm run build`
**Output Directory:** `.next`
**Environment Variables:** Configured in Vercel dashboard

### 10.2 Environment Variables

| Variable | Description | Runtime |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Client + Server |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Client + Server |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role | Server only |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk publishable key | Client |
| CLERK_SECRET_KEY | Clerk secret key | Server |
| CLERK_WEBHOOK_SECRET | Clerk webhook secret | Server |
| RESEND_API_KEY | Resend API key | Server |
| NEXT_PUBLIC_APP_URL | App URL | Client |

### 10.3 Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure Clerk redirect URLs
- [ ] Set up Supabase project and run migrations
- [ ] Configure Resend domain verification
- [ ] Test webhook endpoints
- [ ] Verify RLS policies

---

## 11. Monitoring & Error Handling

### 11.1 Error Boundaries

- React Error Boundaries for component errors
- API route try-catch blocks
- Centralized error logging

### 11.2 Future Monitoring (Recommended)

- Sentry for error tracking
- Vercel Analytics for performance
- Supabase Dashboard for database monitoring

---

## 12. Performance Considerations

### 12.1 Next.js Optimizations

- Server Components by default
- `use client` only where needed
- Dynamic imports for heavy components
- Image optimization with `next/image`

### 12.2 Database Optimizations

- Proper indexing on frequently queried columns
- Select only needed fields
- Pagination for large lists

### 12.3 Client-Side Optimizations

- Memoization with `useMemo` and `useCallback`
- Virtualization for long lists (future)
- Code splitting by route

---

*Last Updated: 2026-05-07*