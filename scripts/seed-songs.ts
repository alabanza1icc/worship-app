/**
 * seed-songs.ts
 *
 * Inserts 8 seed songs (with song_parts) into Supabase.
 * Skips any song whose title already exists.
 *
 * Run from the project root:
 *   npx tsx scripts/seed-songs.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Load .env.local manually (no dotenv dependency required)
// ---------------------------------------------------------------------------
const envPath = resolve(process.cwd(), '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1) continue
  const key = trimmed.slice(0, eqIndex).trim()
  const value = trimmed.slice(eqIndex + 1).trim()
  if (key && !process.env[key]) process.env[key] = value
}

// ---------------------------------------------------------------------------
// Supabase service-role client (bypasses RLS)
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
interface SongPart {
  name: string
  content: string
  order_index: number
}

interface SeedSong {
  title: string
  artist: string
  original_key: string
  tempo: number
  tags: string[]
  notes: string
  youtube_url: string
  spotify_url?: string
  has_audio: boolean
  status: 'active' | 'archived'
  parts: SongPart[]
}

const SONGS: SeedSong[] = [
  {
    title: 'La Bondad de Dios',
    artist: 'Bethel Music',
    original_key: 'La',
    tempo: 68,
    tags: ['adoración', 'alabanza'],
    notes: 'Canción suave de adoración, dinámica de menos a más',
    youtube_url: 'https://www.youtube.com/watch?v=NJsQdKrHFfw',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[La]Grande es Tu bondad [Re]grande es Tu amor\n[Mi]Cantaré por siempre de [La]tu fidelidad',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Re]La bondad de Dios [La]me persigue cada día\n[Mi]En Sus misericordias [La]viviré',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Hacedor de Caminos',
    artist: 'Sinach',
    original_key: 'Si',
    tempo: 80,
    tags: ['declaración', 'profética'],
    notes: 'Tempo constante, ideal para servicio de jóvenes',
    youtube_url: 'https://www.youtube.com/watch?v=9VFa7ADZ3P8',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Si]Eres hacedor de caminos [Fa#]cuando no veo ninguno\n[Sol#m]Te adoro Señor [Re#]con todo lo que soy',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Si]Way maker [Fa#]miracle worker [Sol#m]promise keeper [Re#]light in the darkness\n[Si]My God [Fa#]that is who You are',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Qué Hermoso Nombre',
    artist: 'Hillsong Worship',
    original_key: 'Re',
    tempo: 68,
    tags: ['adoración'],
    notes: 'Canción contemplativa de adoración',
    youtube_url: 'https://www.youtube.com/watch?v=UBFV4iJrxsA',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Re]Tú moriste en la cruz [La]por mis pecados\n[Sol]Te pusieron en la tumba [Re]pensaron que habías terminado',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Sol]Qué hermoso nombre es el Tuyo [Re]oh Cristo\n[Sol]Qué hermoso nombre es el Tuyo [Re]mi Salvador',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Océanos',
    artist: 'Hillsong United',
    original_key: 'Sol',
    tempo: 72,
    tags: ['adoración', 'fe'],
    notes: 'Construcción gradual, muy atmosférica',
    youtube_url: 'https://www.youtube.com/watch?v=dy9nchG-Mrs',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Sol]Tú me llamas a través de las aguas\n[Re]A caminar sobre las olas\n[Mi]En el momento que mi fe se debilita\n[Do]Tus aguas me guardarán',
        order_index: 0,
      },
      {
        name: 'Puente',
        content:
          '[Sol]Espíritu guíame [Re]donde mi fe [Mi]sea sin límites\n[Do]Profundidades mayores que mis pies [Sol]conocerán',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Reckless Love',
    artist: 'Cory Asbury',
    original_key: 'Re',
    tempo: 60,
    tags: ['adoración', 'íntimo'],
    notes: 'Tempo muy tranquilo, para momentos íntimos de adoración',
    youtube_url: 'https://www.youtube.com/watch?v=Sc6SSHuZvQE',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Re]Antes que yo hablara [La]Tú me conociste\n[Sol]Antes que yo naciera [Re]me llamaste Tuyo',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Sol]Oh el amor sin medida [Re]sin causa sin límite\n[La]Amor reckless [Re]de Dios',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Living Hope',
    artist: 'Phil Wickham',
    original_key: 'Si',
    tempo: 132,
    tags: ['alabanza', 'victorioso'],
    notes: 'Tempo animado, bueno para abrir servicios',
    youtube_url: 'https://www.youtube.com/watch?v=rLEFdcSoGVY',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Si]¿Cuánto dolor tomó en vida? [Fa#]¿A cuántos ciegos Él abrió los ojos?\n[Sol#m]¿Qué tan lejos llegó Su amor? [Re#]Todo el camino hasta la cruz',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Si]¡Aleluya alabado sea el Señor! [Fa#]Oh mi alma canta\n[Sol#m]¿Quién es como Él? [Re#]¡El Señor Jesús!',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Goodness Of God',
    artist: 'Bethel Music',
    original_key: 'Sol',
    tempo: 65,
    tags: ['adoración', 'gratitud'],
    notes: 'Similar a La Bondad de Dios pero con diferente arreglo',
    youtube_url: 'https://www.youtube.com/watch?v=QN72B6PnzaU',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Sol]Amarte es lo que quiero [Re]toda mi vida\n[Mi]Eres bueno [Do]eres bueno conmigo',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Do]La bondad de Dios [Sol]cada mañana\n[Re]Nueva es Tu misericordia [Mi]Señor [Do]gracias a Ti',
        order_index: 1,
      },
    ],
  },
  {
    title: 'Holy Forever',
    artist: 'Bethel Music',
    original_key: 'Sol',
    tempo: 72,
    tags: ['adoración', 'congregacional'],
    notes: 'Perfecta para cierre del servicio',
    youtube_url: 'https://www.youtube.com/watch?v=M4vjT_qjXAw',
    has_audio: false,
    status: 'active',
    parts: [
      {
        name: 'Verso 1',
        content:
          '[Sol]A glorious day [Re]Worthy is the Lamb\n[Mi]Who was and is [Do]and is to come',
        order_index: 0,
      },
      {
        name: 'Coro',
        content:
          '[Sol]¡Santo para siempre! [Re]Santo para siempre\n[Mi]Tu gloria y Tu gracia [Do]llenan la creación',
        order_index: 1,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Starting song seed...\n')

  // Fetch existing song titles to avoid duplicates
  const { data: existingSongs, error: fetchError } = await supabase
    .from('songs')
    .select('title')

  if (fetchError) {
    console.error('Failed to fetch existing songs:', fetchError.message)
    process.exit(1)
  }

  const existingTitles = new Set((existingSongs ?? []).map((s: { title: string }) => s.title))

  let inserted = 0
  let skipped = 0

  for (const song of SONGS) {
    if (existingTitles.has(song.title)) {
      console.log(`  SKIP  "${song.title}" — already exists`)
      skipped++
      continue
    }

    const { parts, ...songData } = song

    // Insert the song row
    const { data: insertedSong, error: songError } = await supabase
      .from('songs')
      .insert(songData)
      .select('id')
      .single()

    if (songError || !insertedSong) {
      console.error(`  ERROR inserting "${song.title}":`, songError?.message)
      continue
    }

    const songId = insertedSong.id as string

    // Insert song parts
    const partsPayload = parts.map((part) => ({
      song_id: songId,
      name: part.name,
      content: part.content,
      order_index: part.order_index,
    }))

    const { error: partsError } = await supabase.from('song_parts').insert(partsPayload)

    if (partsError) {
      console.error(`  ERROR inserting parts for "${song.title}":`, partsError.message)
      continue
    }

    console.log(`  INSERT "${song.title}" — ${parts.length} part(s) added (id: ${songId})`)
    inserted++
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
