const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");

// small helpers
function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function notify(email, ip) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return; // don't fail the request on mail
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: String(SMTP_SECURE || "true") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  try { await transporter.verify(); } catch {}
  await transporter.sendMail({
    from: process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>",
    to: process.env.SUBSCRIBE_NOTIFY_TO || "phil@briko.app",
    subject: "New Briko subscriber",
    text: `Email: ${email}\nWhen: ${new Date().toISOString()}\nIP: ${ip || "n/a"}` 
  }).catch(() => {});
}

module.exports = async function (context, req) {
  // CORS preflight (quiet console)
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": (req.headers && req.headers.origin) || "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    };
    return;
  }

  try {
    const { email, hp } = (req.body || {});
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      context.res = { status: 400, jsonBody: { ok: false, error: "Invalid email." } };
      return;
    }
    if (hp && String(hp).trim() !== "") {
      context.res = { status: 200, jsonBody: { ok: true } }; // honeypot
      return;
    }

    const client = supa();
    const xff = (req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]) ) || "";
    const ip = Array.isArray(xff) ? xff[0] : String(xff).split(",")[0] || null;

    const { error } = await client.from("subscriptions").insert({ email, ip, user_id: null });
    if (error && error.code !== "23505") {
      context.log.error("Supabase insert error:", error);
      context.res = { status: 500, jsonBody: { ok: false, error: "Subscription failed. Try again later." } };
      return;
    }

    await notify(email, ip);
    context.res = { status: 200, jsonBody: { ok: true } };
  } catch (e) {
    context.log.error("Subscribe exception:", e);
    context.res = { status: 500, jsonBody: { ok: false, error: "Subscription failed. Try again later." } };
  }
};
