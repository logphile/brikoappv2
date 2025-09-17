#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[seed-gallery] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  console.error('  Set them in your shell for this process, e.g.:')
  console.error('    $env:SUPABASE_URL = "https://xxxx.supabase.co"')
  console.error('    $env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"')
  process.exit(1)
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const SAMPLE_DIR = path.join(ROOT, 'public', 'samples', 'gallery')
const PROJECTS_BUCKET = 'projects'

const FAKE_USERS = [
  { email: 'alex@example.test',   password: 'Passw0rd!', handle: 'alex',   name: 'Alex'   },
  { email: 'bri@example.test',    password: 'Passw0rd!', handle: 'bri',    name: 'Bri'    },
  { email: 'cami@example.test',   password: 'Passw0rd!', handle: 'cami',   name: 'Cami'   },
  { email: 'dev@example.test',    password: 'Passw0rd!', handle: 'dev',    name: 'Dev'    },
  { email: 'eli@example.test',    password: 'Passw0rd!', handle: 'eli',    name: 'Eli'    },
  { email: 'fin@example.test',    password: 'Passw0rd!', handle: 'fin',    name: 'Fin'    },
  { email: 'gray@example.test',   password: 'Passw0rd!', handle: 'gray',   name: 'Gray'   },
  { email: 'harlow@example.test', password: 'Passw0rd!', handle: 'harlow', name: 'Harlow' },
]

async function ensureBucketPublic(name) {
  try {
    // Try to create (idempotent-ish)
    const { error: ce } = await supa.storage.createBucket(name, {
      public: true,
      fileSizeLimit: '5242880', // ~5MB
      allowedMimeTypes: ['image/png']
    })
    if (ce) {
      // If it exists, update to public just in case
      if (!String(ce.message || '').toLowerCase().includes('already exists')) {
        console.warn('[seed-gallery] createBucket warning:', ce.message)
      }
      const { error: ue } = await supa.storage.updateBucket(name, { public: true })
      if (ue && !String(ue.message || '').toLowerCase().includes('no changes')) {
        console.warn('[seed-gallery] updateBucket warning:', ue.message)
      }
    }
  } catch (e) {
    console.warn('[seed-gallery] ensureBucketPublic error:', e?.message || e)
  }
}

async function listUsers() {
  const all = []
  let page = 1
  while (true) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    all.push(...(data?.users ?? []))
    if (!data || data.users.length < 1000) break
    page++
  }
  return all
}

async function ensureUser(u, userIndex) {
  const users = await listUsers()
  const found = users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase())
  if (found) return found.id
  const { data, error } = await supa.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { handle: u.handle, name: u.name, seed: true, i: userIndex }
  })
  if (error) throw error
  return data.user.id
}

async function readSampleFiles() {
  const entries = await fs.readdir(SAMPLE_DIR)
  const files = entries
    .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    .sort((a, b) => a.localeCompare(b))
  if (!files.length) {
    throw new Error(`No images found in ${SAMPLE_DIR}. Add .png/.jpg images first.`)
  }
  return files.map((f) => path.join(SAMPLE_DIR, f))
}

async function toPngBuffer(localPath) {
  // Transcode and resize to keep previews small
  const image = sharp(localPath)
  const meta = await image.metadata()
  const maxDim = 1024 // cap max dimension
  const w = meta.width || maxDim
  const h = meta.height || maxDim
  const needResize = Math.max(w, h) > maxDim
  const pipeline = needResize ? image.resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true }) : image
  const buf = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
  return buf
}

async function uploadPreview(userId, projectId, pngBuffer) {
  const key = `${userId}/${projectId}/preview.png`
  const { error } = await supa.storage.from(PROJECTS_BUCKET).upload(key, pngBuffer, {
    upsert: true,
    contentType: 'image/png',
    cacheControl: '31536000, immutable'
  })
  if (error) throw error
  return `projects/${key}`
}

function sampleTitle(kind) {
  const nouns = ['City Skyline','Retro Portrait','Space Cat','Arcade Bot','Desert Dunes','Wave Study','Pixel Rose','Neon Skull','Low-poly Ship','VHS Sunset','Cyber Fox','Parrot']
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `${n} ${kind === 'voxel' ? 'Voxel' : 'Mosaic'}`
}

async function insertProject(userId, kind) {
  // Prefer new schema with status='public'
  const payload = {
    user_id: userId,
    title: sampleTitle(kind),
    kind,
    status: 'public',
    bricks: Math.floor(400 + Math.random() * 2000),
    cost_est: Math.round((10 + Math.random() * 80) * 100) / 100,
    tags: []
  }
  let res = await supa.from('user_projects').insert(payload).select('*').single()
  if (!res.error && res.data) return res.data

  // Fallback: older schema using is_public/published_at
  const fallback = {
    user_id: userId,
    title: sampleTitle(kind),
    kind,
    is_public: true,
    published_at: new Date().toISOString()
  }
  res = await supa.from('user_projects').insert(fallback).select('*').single()
  if (res.error) throw res.error
  return res.data
}

async function updatePreviewPath(projectId, previewPath) {
  const { error } = await supa.from('user_projects').update({ preview_path: previewPath }).eq('id', projectId)
  if (error) throw error
}

async function main() {
  console.log('[seed-gallery] Ensuring storage bucket public…')
  await ensureBucketPublic(PROJECTS_BUCKET)

  console.log('[seed-gallery] Reading sample images from', SAMPLE_DIR)
  const sampleFiles = await readSampleFiles()

  console.log(`[seed-gallery] Ensuring ${FAKE_USERS.length} users…`)
  const userIds = []
  for (let i = 0; i < FAKE_USERS.length; i++) {
    const uid = await ensureUser(FAKE_USERS[i], i)
    userIds.push(uid)
    console.log('  user', FAKE_USERS[i].email, '→', uid)
  }

  console.log('[seed-gallery] Creating projects and uploading previews…')
  let imgIdx = 0
  for (const uid of userIds) {
    // ~3 projects per user, alternate kinds
    for (let i = 0; i < 3; i++) {
      const p = sampleFiles[imgIdx % sampleFiles.length]
      imgIdx++
      const kind = i % 3 === 1 ? 'voxel' : 'mosaic'
      const png = await toPngBuffer(p)
      const row = await insertProject(uid, kind)
      const previewPath = await uploadPreview(uid, row.id, png)
      await updatePreviewPath(row.id, previewPath)
      console.log(`  project ${row.id} (${kind}) ← ${path.basename(p)} → ${previewPath}`)
    }
  }

  console.log('[seed-gallery] Done. Open /gallery to see seeded projects.')
}

main().catch((err) => {
  console.error('[seed-gallery] ERROR:', err?.message || err)
  process.exit(1)
})
