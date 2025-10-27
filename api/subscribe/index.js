module.exports = async function (context, req) {
  // Preflight
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    }};
    return;
  }

  try {
    const { email, hp } = (req.body || {});
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      context.res = { status: 400, jsonBody: { ok:false, error:"invalid_email" } };
      return;
    }
    if (hp && String(hp).trim() !== "") {
      context.res = { status: 200, jsonBody: { ok:true } };
      return;
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) throw new Error("server_supabase_env_missing");

    // require inside try so module errors return JSON, not empty 500
    const { createClient } = require("@supabase/supabase-js");

    const supa = createClient(url, key, { auth: { persistSession:false } });
    const ipHdr = req.headers["x-forwarded-for"] || "";
    const ip = Array.isArray(ipHdr) ? ipHdr[0] : String(ipHdr).split(",")[0] || null;

    const { error } = await supa.from("subscriptions").insert({ email, ip, user_id: null });
    if (error && error.code !== "23505") {
      context.res = { status: 500, jsonBody: { ok:false, error:"db_insert_failed", code:error.code, detail:error.message } };
      return;
    }

    // SMTP disabled during debug; re-enable after 200 OK works.
    context.res = { status: 200, jsonBody: { ok:true } };
  } catch (e) {
    context.res = { status: 500, jsonBody: { ok:false, error:String(e && e.message || e) } };
  }
};
