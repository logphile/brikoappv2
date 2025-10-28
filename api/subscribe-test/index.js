const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');

function json(status, body, extraHeaders = {}) {
  return { status, headers: { 'content-type':'application/json', ...extraHeaders }, body: JSON.stringify(body) };
}

module.exports = async function (context, req) {
  const email = (req.query && req.query.email ? String(req.query.email) : '').trim();
  const role = keyRole(process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE);

  if (!email) return json(400, { ok:false, code:'NO_EMAIL' }, { 'x-key-role': role });

  try {
    const supa = serverSupabase();
    const { error } = await supa
      .from('subscriptions')
      .upsert({ email, source:'test' }, { onConflict:'email', ignoreDuplicates:true });

    if (error) {
      context.log.error('[subscribe-test] DB_ERROR', error.message);
      return json(409, { ok:false, code:'DB', message: error.message }, { 'x-key-role': role });
    }
    return json(200, { ok:true }, { 'x-key-role': role });
  } catch (e) {
    context.log.error('[subscribe-test] UNHANDLED', (e && (e.message || e)) || 'unknown');
    return json(500, { ok:false, code:'UNKNOWN' }, { 'x-key-role': role });
  }
};
