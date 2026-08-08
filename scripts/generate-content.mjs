import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInitialContent, normalizeProfileContent } from '../src/content/profileSchema.js'

const outputDirectory = resolve('public/content')
const outputPath = resolve(outputDirectory, 'profile.json')
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

let content = createInitialContent()
let source = 'profile.js fallback'

if (supabaseUrl && anonKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_publications?id=eq.profile&select=content`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`)
    const rows = await response.json()
    if (rows[0]?.content) {
      content = normalizeProfileContent(rows[0].content)
      source = 'Supabase publication'
    }
  } catch (error) {
    console.warn(`[content] Could not read Supabase publication: ${error.message}`)
  }
}

await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
console.log(`[content] Generated public/content/profile.json from ${source}`)
