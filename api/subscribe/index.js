// api/subscribe/index.js
module.exports = async function (context, req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    }};
    return;
  }

  try {
    // 0) Basic payload check
    const body = req.body || {};
    const email = String(body.email || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      context.res = { status: 400, jsonBody: { ok:false, error:"invalid_email" } };
      return;
    }

    // 1) Env check
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
      context.res = { status: 500, jsonBody: { ok:false, error:"server_supabase_env_missing", haveUrl:!!url, haveKey:!!key } };
      return;
    }

    // 2) Require inside try so module errors surface in JSON (not empty 500)
    const { createClient } = require("@supabase/supabase-js");

    // 3) Create client
    let supa;
    try {
      supa = createClient(url, key, { auth: { persistSession:false } });
    } catch (e) {
      context.res = { status: 500, jsonBody: { ok:false, error:"create_client_failed", detail:String(e?.message || e) } };
      return;
    }

    // 4) Quick read to prove connectivity/table
    const ping = await supa.from("subscriptions").select("id").limit(1);
    if (ping.error) {
      context.res = { status: 500, jsonBody: { ok:false, error:"db_read_failed", code: ping.error.code, detail: ping.error.message } };
      return;
    }

    // 5) Insert (duplicates accepted)
    const ipHdr = req.headers["x-forwarded-for"] || "";
    const ip = Array.isArray(ipHdr) ? ipHdr[0] : String(ipHdr).split(",")[0] || null;
    const ins = await supa.from("subscriptions").insert({ email, ip, user_id: null });
    if (ins.error && ins.error.code !== "23505") {
      context.res = { status: 500, jsonBody: { ok:false, error:"db_insert_failed", code: ins.error.code, detail: ins.error.message } };
      return;
    }

    // 6) Success (email notify comes later)
    context.res = { status: 200, jsonBody: { ok:true } };
  } catch (e) {
    // Catch absolutely everything with a JSON body
    context.res = { status: 500, jsonBody: { ok:false, error:"server_exception", detail:String(e?.message || e) } };
  }
};
