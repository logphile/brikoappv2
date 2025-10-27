const { createClient } = require("@supabase/supabase-js");

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    }};
    return;
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) throw new Error("server_supabase_env_missing");

    // if require or createClient fails, we’ll see it now
    const supa = createClient(url, key, { auth: { persistSession:false } });

    context.res = { status: 200, jsonBody: { ok: true, stage: "client" } };
  } catch (e) {
    context.res = { status: 500, jsonBody: { ok:false, error:String(e?.message || e) } };
  }
};
