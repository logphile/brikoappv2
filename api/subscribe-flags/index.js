const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');

module.exports = async function (context, req) {
  const email = (req.query && req.query.email ? String(req.query.email) : '').trim();
  const role = keyRole(process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE);
  const welcomeOn = String(process.env.WELCOME_EMAIL_ENABLED || 'false').toLowerCase() === 'true';
  const notifyTo = process.env.SUBSCRIBE_NOTIFY_TO || null;

  let exists = null, err = null;
  try {
    if (email) {
      const supa = serverSupabase();
      const q = await supa.from('subscriptions').select('email').eq('email', email).maybeSingle();
      exists = !!q.data;
      err = q.error ? q.error.message : null;
    }
  } catch (e) { err = e && (e.message || String(e)); }

  context.res = {
    status: 200,
    headers: { 'content-type':'application/json', 'x-key-role': role },
    body: JSON.stringify({ role, welcomeOn, notifyToPresent: !!notifyTo, exists, err })
  };
};
