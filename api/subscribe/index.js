const { createClient } = require("@supabase/supabase-js");
// const nodemailer = require("nodemailer"); // disable for now to remove SMTP as a variable

function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error("server_supabase_env_missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = async function (context, req) {
  // CORS/preflight
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    }};
    return;
  }

  try {
    const { email, hp } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      context.res = { status: 400, jsonBody: { ok:false, error:"invalid_email" } };
      return;
    }
    if (hp && String(hp).trim() !== "") {
      context.res = { status: 200, jsonBody: { ok:true } }; // honeypot
      return;
    }

    let ip = null;
    try {
      const ipHdr = req.headers["x-forwarded-for"] || "";
      ip = Array.isArray(ipHdr) ? ipHdr[0] : String(ipHdr).split(",")[0] || null;
    } catch {}

    const client = supa();

    const { error } = await client.from("subscriptions").insert({ email, ip, user_id: null });
    if (error && error.code !== "23505") {
      context.log.error("db_insert_failed:", error);
      context.res = { status: 500, jsonBody: { ok:false, error:"db_insert_failed", code:error.code, detail:error.message } };
      return;
    }

    // SMTP temporarily disabled during debug
    // await notify(email, ip);

    context.res = { status: 200, jsonBody: { ok:true } };
  } catch (e) {
    const tag = (e && e.message) || "server_exception";
    context.log.error("subscribe_exception:", e);
    context.res = { status: 500, jsonBody: { ok:false, error:tag } };
  }
};
