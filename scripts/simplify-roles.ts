/**
 * simplify-roles.ts
 *
 * Migration script: collapses 'musician' and 'multimedia' roles into 'participant'.
 * Leaves 'admin' and 'participant' rows untouched.
 *
 * Run from the project root:
 *   npx tsx scripts/simplify-roles.ts
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
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Starting role simplification migration...\n')

  const rolesToMigrate = ['musician', 'multimedia'] as const

  // Count affected rows before updating so we can report accurately
  const { count: beforeCount, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', rolesToMigrate)

  if (countError) {
    console.error('Failed to count affected profiles:', countError.message)
    process.exit(1)
  }

  const affected = beforeCount ?? 0
  console.log(`Profiles with role 'musician' or 'multimedia': ${affected}`)

  if (affected === 0) {
    console.log('\nNothing to update — all roles are already simplified.')
    return
  }

  // Perform the update
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'participant' })
    .in('role', rolesToMigrate)

  if (updateError) {
    console.error('Failed to update roles:', updateError.message)
    process.exit(1)
  }

  console.log(`\nSuccess. ${affected} profile(s) updated to 'participant'.`)
  console.log("Roles 'admin' and 'participant' were left unchanged.")
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
