/**
 * Copies authoritative sound guide into public/ for the Sound Guide page.
 * Run: node scripts/copy-sound-guide-to-public.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const src = path.join(ROOT, 'content', 'sound-guide.json')
const dest = path.join(ROOT, 'public', 'sound-guide.json')

if (!fs.existsSync(src)) {
  console.error('copy-sound-guide: missing', src)
  process.exit(1)
}

fs.copyFileSync(src, dest)
console.log('copy-sound-guide: copied content/sound-guide.json → public/sound-guide.json')
