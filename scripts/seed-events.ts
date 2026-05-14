/**
 * seed-events.ts
 *
 * Deletes all existing events and inserts Thursday + Sunday services
 * from today until 2050-12-31.
 *
 * Thursdays: "Programación jueves D de MES"  19:00 – 00:30 (next day)
 * Sundays:   "Programación domingo D de MES" 07:00 – 11:00
 *
 * Run: npx tsx scripts/seed-events.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const value = trimmed.slice(eq + 1).trim()
  if (key && !process.env[key]) process.env[key] = value
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatTitle(dayOfWeek: 'Jueves' | 'Domingo', date: Date): string {
  const day = date.getDate()
  const month = MONTHS_ES[date.getMonth()]
  return `Programación ${dayOfWeek} ${day} de ${month}`
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

async function main() {
  console.log('Deleting existing events...')
  const { error: delError } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delError) {
    console.error('Error deleting events:', delError.message)
    process.exit(1)
  }
  console.log('All events deleted.\n')

  // Generate Thursday and Sunday events from today to 2050-12-31
  const start = new Date('2026-05-13')
  const end   = new Date('2050-12-31')

  const events: {
    title: string
    event_type: string
    event_date: string
    start_time: string
    end_time: string
    is_live: boolean
    is_published: boolean
  }[] = []

  const cur = new Date(start)
  while (cur <= end) {
    const dow = cur.getDay() // 0=Sun, 4=Thu
    if (dow === 4) {
      // Thursday service 19:00 – 20:30
      events.push({
        title: formatTitle('Jueves', cur),
        event_type: 'otro',
        event_date: toDateStr(cur),
        start_time: '19:00:00',
        end_time: '20:30:00',
        is_live: false,
        is_published: true,
      })
    } else if (dow === 0) {
      // Sunday service 07:00 – 11:00
      events.push({
        title: formatTitle('Domingo', cur),
        event_type: 'servicio_dominical',
        event_date: toDateStr(cur),
        start_time: '07:00:00',
        end_time: '11:00:00',
        is_live: false,
        is_published: true,
      })
    }
    cur.setDate(cur.getDate() + 1)
  }

  console.log(`Inserting ${events.length} events...`)

  // Insert in chunks of 500 to avoid payload limits
  const CHUNK = 500
  let inserted = 0
  for (let i = 0; i < events.length; i += CHUNK) {
    const chunk = events.slice(i, i + CHUNK)
    const { error } = await supabase.from('events').insert(chunk)
    if (error) {
      console.error(`Error inserting chunk at index ${i}:`, error.message)
      process.exit(1)
    }
    inserted += chunk.length
    console.log(`  ${inserted} / ${events.length}`)
  }

  console.log(`\nDone. ${inserted} events inserted.`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
