module.exports = async function (context, req) {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
      context.res = { status: 500, jsonBody: { ok:false, where:"env", haveUrl:!!url, haveKey:!!key } };
      return;
    }
    const { createClient } = require("@supabase/supabase-js");
    const supa = createClient(url, key, { auth: { persistSession:false } });
    const { data, error } = await supa.from("subscriptions").select("id").limit(1);
    if (error) {
      context.res = { status: 500, jsonBody: { ok:false, where:"db", code:error.code, message:error.message } };
      return;
    }
    context.res = { status: 200, jsonBody: { ok:true, where:"diag", rows:(data||[]).length } };
  } catch (e) {
    context.res = { status: 500, jsonBody: { ok:false, where:"exception", message:String(e && e.message || e) } };
  }
};
