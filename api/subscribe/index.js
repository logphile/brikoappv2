// api/subscribe/index.js
module.exports = async function (context, req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": req.headers.origin || "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    };
    return;
  }

  try {
    const email = String((req.body && req.body.email) || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "invalid_email" })
      };
      return;
    }

    // 1) Env check
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "server_supabase_env_missing", haveUrl: !!url, haveKey: !!key })
      };
      return;
    }

    // 2) Require inside try so module errors surface as JSON
    const { createClient } = require("@supabase/supabase-js");

    // 3) Create client
    let supa;
    try {
      supa = createClient(url, key, { auth: { persistSession: false } });
    } catch (e) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "create_client_failed", detail: String(e?.message || e) })
      };
      return;
    }

    // 4) Quick read to prove connectivity/table
    const ping = await supa.from("subscriptions").select("id").limit(1);
    if (ping.error) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "db_read_failed", code: ping.error.code, detail: ping.error.message })
      };
      return;
    }

    // 5) Insert (duplicates accepted)
    const ipHdr = req.headers["x-forwarded-for"] || "";
    const ip = Array.isArray(ipHdr) ? ipHdr[0] : String(ipHdr).split(",")[0] || null;
    const ins = await supa.from("subscriptions").insert({ email, ip, user_id: null });
    if (ins.error && ins.error.code !== "23505") {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "db_insert_failed", code: ins.error.code, detail: ins.error.message })
      };
      return;
    }

    // 6) Best-effort SMTP notify/welcome (non-blocking)
    try {
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SSL || process.env.SMTP_SECURE || "true") === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      // 1) Notify Phil
      await transporter.sendMail({
        from: process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>",
        to: process.env.SUBSCRIBE_NOTIFY_TO || "phil@briko.app",
        subject: "New Briko subscriber",
        text: `Email: ${email}\nWhen: ${new Date().toISOString()}\nIP: ${ip || "n/a"}` 
      }).catch(() => {}); // don't block on mail

      // 2) Optional welcome email to the subscriber (uncomment if you want it)
      // await transporter.sendMail({
      //   from: process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>",
      //   to: email,
      //   replyTo: "phil@briko.app",
      //   subject: "You’re in — Briko updates",
      //   text:
      // `Hey!
      // 
      // You’re on the Briko list. We’ll share new builds, parts packs, and early features soon.
      // If you ever want off, just reply “unsubscribe”.
      // 
      // – Phil @ Briko`
      // }).catch(() => {});
    } catch (_) { /* swallow mail errors */ }

    // 7) Success
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "server_exception", detail: String(e?.message || e) })
    };
  }
};
