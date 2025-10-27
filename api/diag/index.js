const { createClient } = require("@supabase/supabase-js");

module.exports = async function (context, req) {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const haveUrl = !!url, haveKey = !!key;

    if (!haveUrl || !haveKey) {
      context.res = { status: 500, jsonBody: { ok:false, where:"env", haveUrl, haveKey } };
      return;
    }

    const supa = createClient(url, key, { auth: { persistSession: false } });

    // light touch: list 0 rows just to prove connectivity
    const { data, error } = await supa.from("subscriptions").select("id").limit(1);
    if (error) {
      context.log.error("Supabase error:", error);
      context.res = { status: 500, jsonBody: { ok:false, where:"db", code:error.code, message:error.message } };
      return;
    }

    context.res = { status: 200, jsonBody: { ok:true, where:"diag", rows: (data||[]).length } };
  } catch (e) {
    context.log.error("Diag exception:", e);
    context.res = { status: 500, jsonBody: { ok:false, where:"exception", message:String(e && e.message || e) } };
  }
};
