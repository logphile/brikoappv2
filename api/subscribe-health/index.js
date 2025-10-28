const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');

module.exports = async function (context, req) {
  const url = process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL;
  const svc = process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;

  let db_ok = false, db_error = null;
  try {
    const supa = serverSupabase();
    const test = await supa.from('subscriptions').select('id').limit(1);
    db_ok = !test.error;
    db_error = test.error ? (test.error.message || 'unknown') : null;
  } catch (e) { db_error = (e && (e.message || String(e))) || null; }

  context.res = {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-key-role': keyRole(svc) },
    body: JSON.stringify({
      has_url: Boolean(url),
      role: keyRole(svc),
      db_ok, db_error
    })
  };
};
