import { z } from 'zod'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody, setResponseStatus, getRequestIP } from 'h3'
import type { H3Event } from 'h3'

const EmailSchema = z.object({
  email: z.string().email().max(254),
  hp: z.string().optional().default(''),
})

function supa() {
  const url = process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY || ''
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env as Record<string, string | undefined>
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: String(SMTP_SECURE ?? 'true') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  await transporter.verify().catch(() => {})
  return transporter
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const parsed = EmailSchema.safeParse(body)
    if (!parsed.success) {
      setResponseStatus(event, 400)
      return { ok: false, error: 'Invalid email.' }
    }
    const { email, hp } = parsed.data
    if (hp && hp.trim() !== '') {
      return { ok: true }
    }

    const client = supa()
    const ip = getRequestIP(event) || null
    const { error } = await client.from('subscriptions').insert({ email, ip, user_id: null })
    if (error) {
      const dup = /duplicate key|unique constraint/i.test(error.message || '')
      if (!dup) throw error
    }

    const transporter = await mailer()
    if (transporter) {
      await transporter
        .sendMail({
          from: process.env.SUBSCRIBE_FROM || 'Briko <phil@briko.app>',
          to: process.env.SUBSCRIBE_NOTIFY_TO || 'phil@briko.app',
          subject: 'New Briko subscriber',
          text: `Email: ${email}\nWhen: ${new Date().toISOString()}\nIP: ${ip ?? 'n/a'}`,
        })
        .catch(() => {})
    }

    return { ok: true }
  } catch (err) {
    setResponseStatus(event, 500)
    return { ok: false, error: 'Subscription failed. Try again later.' }
  }
})
