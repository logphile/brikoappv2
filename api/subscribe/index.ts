import type { HttpRequest, InvocationContext } from "@azure/functions";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { z } from "zod";

const EmailSchema = z.object({
  email: z.string().email().max(254),
  hp: z.string().optional().default("")
});

function supa() {
  const url = process.env.SUPABASE_URL!;
  const key = (process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY)!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function sendMail(email: string, ip: string | null) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env as Record<string, string | undefined>;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: String(SMTP_SECURE ?? "true") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  try { await transporter.verify(); } catch {}

  await transporter.sendMail({
    from: process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>",
    to: process.env.SUBSCRIBE_NOTIFY_TO || "phil@briko.app",
    subject: "New Briko subscriber",
    text: `Email: ${email}\nWhen: ${new Date().toISOString()}\nIP: ${ip ?? "n/a"}`
  }).catch(() => {});
}

export default async function (req: HttpRequest, ctx: InvocationContext) {
  // CORS (204 for OPTIONS keeps console quiet)
  if (req.method === "OPTIONS") {
    return {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    };
  }

  try {
    const body = await req.json();
    const parsed = EmailSchema.safeParse(body);
    if (!parsed.success) {
      return { status: 400, jsonBody: { ok: false, error: "Invalid email." } };
    }
    const { email, hp } = parsed.data;
    if (hp && hp.trim() !== "") {
      return { status: 200, jsonBody: { ok: true } }; // honeypot
    }

    const client = supa();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || null;

    const { error } = await client.from("subscriptions").insert({ email, ip, user_id: null });
    if (error && (error as any).code !== "23505") {
      ctx.error("Insert error", error);
      return { status: 500, jsonBody: { ok: false, error: "Subscription failed. Try again later." } };
    }

    await sendMail(email, ip);
    return { status: 200, jsonBody: { ok: true } };
  } catch (e) {
    ctx.error("Subscribe exception", e);
    return { status: 500, jsonBody: { ok: false, error: "Subscription failed. Try again later." } };
  }
}
