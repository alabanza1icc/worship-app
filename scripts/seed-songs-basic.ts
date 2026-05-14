import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const t = line.trim(); if (!t || t.startsWith('#')) continue
  const eq = t.indexOf('='); if (eq === -1) continue
  const k = t.slice(0, eq).trim(); const v = t.slice(eq + 1).trim()
  if (k && !process.env[k]) process.env[k] = v
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const SONGS = [
  { title: "10,000 Razones", artist: "David Scarpeta", original_key: "Sol", tempo: 72, youtube_url: "https://www.youtube.com/watch?v=1nTSLC1Ue1s", has_audio: false, status: "active", tags: [] },
  { title: "A casa - Living", artist: "Living", original_key: "Reb", tempo: 80, youtube_url: "https://www.youtube.com/watch?v=LgDXUgzd3Z4", has_audio: false, status: "active", tags: [] },
  { title: "A casa e sua - Casa Worship", artist: "Casa Worship", original_key: "Lab", tempo: 67, youtube_url: "https://www.youtube.com/watch?v=5QHF5OQeFOs", has_audio: false, status: "active", tags: [] },
  { title: "A Danzar", artist: "Barak", original_key: "Mi", tempo: 140, youtube_url: "https://www.youtube.com/watch?v=W9tUnz5dvXg", has_audio: false, status: "active", tags: [] },
  { title: "A el alto y sublime", artist: "Gadiel Espinoza", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=DFMfxhrxyfQ", has_audio: false, status: "active", tags: [] },
  { title: "A el alto y sublime - Kike Pavon", artist: "Kike Pavon", original_key: "Do", tempo: 61, youtube_url: "https://www.youtube.com/watch?v=86EtWfSTHQk", has_audio: false, status: "active", tags: [] },
  { title: "A ti-Temprano yo te buscaré", artist: "Kike Pavon", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=xeIc5bMkOYo", has_audio: false, status: "active", tags: [] },
  { title: "Abre mis Ojos", artist: "Danilo Montero", original_key: "Mi", tempo: null, youtube_url: "https://www.youtube.com/watch?v=sAm49exVyZc", has_audio: false, status: "active", tags: [] },
  { title: "Abre tus cielos", artist: "Su presencia", original_key: "Sol", tempo: null, youtube_url: "https://www.youtube.com/watch?v=9LFCz6B1zR4", has_audio: false, status: "active", tags: [] },
  { title: "Aclamad a Dios", artist: "Version ICC", original_key: "Do", tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Admirable", artist: "Christine d Clario", original_key: "Do", tempo: 70, youtube_url: "https://www.youtube.com/watch?v=tkNx2UfAflU", has_audio: false, status: "active", tags: [] },
  { title: "Agradecido", artist: "Miel San Marcos", original_key: "Mib", tempo: 146, youtube_url: "https://www.youtube.com/watch?v=hOZwYdGVqBs", has_audio: false, status: "active", tags: [] },
  { title: "Al digno Dios", artist: "Alfarero", original_key: "Sol", tempo: 72, youtube_url: "https://www.youtube.com/watch?v=1ydzXLOuiMM", has_audio: false, status: "active", tags: [] },
  { title: "Al que es Digno", artist: "Coalo Zamorano", original_key: "Re", tempo: 96, youtube_url: "https://www.youtube.com/watch?v=sfaPM2gKcto", has_audio: false, status: "active", tags: [] },
  { title: "Al que es digno - Version Original", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Al que es Digno 96", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Al que es Digno, Vencio", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Al que está sentado", artist: "Marcos Brunet", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Al que está sentado - Upperroom", artist: "Upperoom", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Al que resucitó", artist: "Elevation Worship", original_key: "Reb", tempo: 74, youtube_url: "https://www.youtube.com/watch?v=O6kqO9AKZE0", has_audio: false, status: "active", tags: [] },
  { title: "Al rey", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Alaba (Praise)", artist: "Elevation Worship", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Alabanza y Honor", artist: "Marcos Witt", original_key: "La", tempo: 101, youtube_url: "https://www.youtube.com/watch?v=KwXA48D8pmw", has_audio: false, status: "active", tags: [] },
  { title: "Alegría", artist: "Miel San Marcos", original_key: "Mib", tempo: 150, youtube_url: "https://www.youtube.com/watch?v=JnDCzKPWYBM", has_audio: false, status: "active", tags: [] },
  { title: "Alegria-Agradecido", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Aleluya (Alegrense los justos)", artist: "Oasis Ministry", original_key: "Solb", tempo: 136, youtube_url: "https://www.youtube.com/watch?v=WUbYKe2DQgU", has_audio: false, status: "active", tags: [] },
  { title: "Algo está cayendo aquí", artist: "Jose Luis Reyes", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=lANiURzyLRE", has_audio: false, status: "active", tags: [] },
  { title: "Alive", artist: "Hillsong Y&F", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Amamos tu presencia", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Amaré al señor mi Dios", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Amor sin condición", artist: "Bethel", original_key: "Solb", tempo: 83, youtube_url: "https://www.youtube.com/watch?v=FddTL87wIhM", has_audio: false, status: "active", tags: [] },
  { title: "Ante tu altar", artist: "Averly Morillo", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Aquí estoy", artist: "Hillsong", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Así como David danzaba", artist: "Oswaldo Herrera", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=etOWRIKFVnA", has_audio: false, status: "active", tags: [] },
  { title: "Asombroso", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Atrae mi corazón", artist: "Marcos Brunet", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=pohE9BbBycM", has_audio: false, status: "active", tags: [] },
  { title: "Atráeme a ti", artist: "Lowsan Melgar", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Avivamiento", artist: "Ingrid Rosario", original_key: "Mi", tempo: 133, youtube_url: "https://www.youtube.com/watch?v=50lLs_jh8-0", has_audio: false, status: "active", tags: [] },
  { title: "Bailando con Dios", artist: "Chris Tomlin", original_key: "Sib", tempo: 128, youtube_url: "https://www.youtube.com/watch?v=In8Hdv1dRYM", has_audio: false, status: "active", tags: [] },
  { title: "Bajo Control", artist: "G12", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Baruch Hashem", artist: "Barak", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Bautizados en fuego", artist: "Monte Santo", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Bendito Jesús", artist: "Danilo Montero", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Bienvenido", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Break free", artist: "Hillsong", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Bueno es alabar - Salmo 84", artist: "Danilo Montero", original_key: "Mi", tempo: 120, youtube_url: "https://www.youtube.com/watch?v=MCwOanvo-8E", has_audio: false, status: "active", tags: [] },
  { title: "Bueno es alabarte", artist: "Danilo Montero", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cambiaré mi tristeza", artist: "Danilo Montero", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Campfire Coritos", artist: "Israel New bred", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cantamos al Rey", artist: "Coalo Zamorano", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Canto danzo salto", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Celebra victorioso", artist: "Juan Carlos Alvarado", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Celebra victorioso - Centro Vida", artist: "Centro Vida", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Celebra Victorioso Medley", artist: "Centro Vida", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cerca de mi", artist: "Su presencia", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Closer", artist: "Bethel", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Come Right Now", artist: "PlanetShakers", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Como en el cielo - Elevation", artist: "Elevation Worship", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Como en el cielo", artist: "Miel San Marcos", original_key: "Do", tempo: 135, youtube_url: "https://www.youtube.com/watch?v=vGJUeAgrxPE", has_audio: false, status: "active", tags: [] },
  { title: "Como no voy a creer", artist: "Christine D'Clario", original_key: "Re", tempo: 72, youtube_url: "https://www.youtube.com/watch?v=1REIaIcLDFo", has_audio: false, status: "active", tags: [] },
  { title: "Con mi Dios", artist: "Jesús Adrián Romero", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=URhQpKme8sE", has_audio: false, status: "active", tags: [] },
  { title: "Con todo", artist: "Hillsong United", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=LSRRFbpqcyo", has_audio: false, status: "active", tags: [] },
  { title: "Conmigo Danza", artist: "Paul Wilbur", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Coritos", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Corro a mi padre/Buen Padre", artist: "Christine D Clario", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cree todo es posible", artist: "Marcos Barrientos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Creo en ti", artist: "Julio Melgar", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cristo es mi Señor - Tu harás - En los Montes", artist: "Marcos Witt", original_key: "Sol", tempo: 95, youtube_url: "https://www.youtube.com/watch?v=fgoUZjaS8eE", has_audio: false, status: "active", tags: [] },
  { title: "Cristo no está muerto-Cuando Pienso", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Cuan bello es el Señor 25 Conmemorativo", artist: "Marcos Witt", original_key: null, tempo: 76, youtube_url: "https://www.youtube.com/watch?v=FquhkXMq-sA", has_audio: false, status: "active", tags: [] },
  { title: "Cuan grande es Dios", artist: "En Espíritu y En Verdad", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=yhSQZHZZy08", has_audio: false, status: "active", tags: [] },
  { title: "Cuando Pienso", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dance Medley", artist: "Miel San Marcos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Danzando", artist: "Gateway", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Danzando-En los montes", artist: null, original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Danzar", artist: "Barak", original_key: "Mi", tempo: 140, youtube_url: "https://www.youtube.com/watch?v=W9tUnz5dvXg", has_audio: false, status: "active", tags: [] },
  { title: "Danzo en el rio", artist: "Miel San Marcos", original_key: "Re", tempo: 135, youtube_url: "https://www.youtube.com/watch?v=A_41_4qgmig", has_audio: false, status: "active", tags: [] },
  { title: "De gloria en gloria", artist: "Marco Barrientos", original_key: "Sib", tempo: 128, youtube_url: "https://www.youtube.com/watch?v=C1uMiacEESE", has_audio: false, status: "active", tags: [] },
  { title: "Derrama de tu fuego", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Derramo el Perfume", artist: "Monte Santo", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Desborde", artist: "Marco Barrientos", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Deseable", artist: "Marcos Brunet", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Deseo Eterno", artist: "Marcos Brunet", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=z8iUcimRZDg", has_audio: false, status: "active", tags: [] },
  { title: "Día de jubileo", artist: "Danilo Montero", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dias de Elias", artist: "Paul Wilbur", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=5kQaBv9HsEA", has_audio: false, status: "active", tags: [] },
  { title: "Digno es el Señor", artist: "Marcela Gandara", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=Z5mrn6Q50co", has_audio: false, status: "active", tags: [] },
  { title: "Digno-Marcos Brunet", artist: "Marcos Brunet", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=xe4KumGJJso", has_audio: false, status: "active", tags: [] },
  { title: "Digo si - Santo", artist: "Coalo Zamorano", original_key: "Re", tempo: 142, youtube_url: "https://www.youtube.com/watch?v=dIcDEJhE-wo", has_audio: false, status: "active", tags: [] },
  { title: "Dios desciende aqui/es aquí es ahora", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dios es Alegre", artist: "Aline Barros", original_key: null, tempo: null, youtube_url: "https://www.youtube.com/watch?v=2iLoau_5sHY", has_audio: false, status: "active", tags: [] },
  { title: "Dios es amor", artist: "Un Corazón", original_key: "Mi", tempo: 132, youtube_url: "https://www.youtube.com/watch?v=NyiR9jpZEgA", has_audio: false, status: "active", tags: [] },
  { title: "Dios es mas grande", artist: "Marcos Witt", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dios Imparable", artist: "Marcos Witt", original_key: "La", tempo: 82, youtube_url: "https://www.youtube.com/watch?v=iOCCVPepUb8", has_audio: false, status: "active", tags: [] },
  { title: "Dios incomparable", artist: "G12", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dios subió a su trono", artist: "Jaime Murrell", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Dulce Refugio", artist: "Danilo Montero", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
  { title: "Echo", artist: "Elevation Worship", original_key: "Re", tempo: 104, youtube_url: "https://www.youtube.com/watch?v=EjPeIENlQRY", has_audio: false, status: "active", tags: [] },
  { title: "El Amado Viene", artist: "Monte Santo", original_key: null, tempo: null, youtube_url: null, has_audio: false, status: "active", tags: [] },
]

async function main() {
  console.log('Deleting existing songs...')
  const { error: delErr } = await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) { console.error('Error:', delErr.message); process.exit(1) }
  console.log('  Done.\n')
  console.log(`Inserting ${SONGS.length} songs...`)
  const { error } = await supabase.from('songs').insert(SONGS)
  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Done. ${SONGS.length} songs inserted.`)
  console.log(`With YouTube: ${SONGS.filter(s => s.youtube_url).length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
