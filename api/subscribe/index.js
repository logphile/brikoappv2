const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');

function json(status, body, extraHeaders = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body)
  };
}

module.exports = async function (context, req) {
  const svc = process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  const role = keyRole(svc);

  try {
    const email = (req.body && req.body.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(422, { ok:false, code:'INVALID_EMAIL', hint:'Please enter a valid email.' }, { 'x-key-role': role });
    }

    if (role !== 'service_role') {
      context.log.error('[subscribe] WRONG_KEY role=', role);
      return json(500, { ok:false, code:'WRONG_KEY', hint:'Server not using service_role key.' }, { 'x-key-role': role });
    }

    const supa = serverSupabase();

    // upsert requires a unique index on email
    const { error } = await supa
      .from('subscriptions')
      .upsert({ email, source: 'site' }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      context.log.error('[subscribe] DB_ERROR', { message: error.message, details: error.details, hint: error.hint });
      return json(409, { ok:false, code:'DB', message: error.message }, { 'x-key-role': role });
    }

    return json(200, { ok:true }, { 'x-key-role': role });
  } catch (e) {
    context.log.error('[subscribe] UNHANDLED', e && (e.stack || e.message || e));
    const code = e && e.code ? e.code : 'UNKNOWN';
    const hint = code === 'CONFIG_MISSING' ? 'Missing Supabase env vars in Azure.' : 'Unexpected server error.';
    return json(500, { ok:false, code, hint }, { 'x-key-role': role });
  }
};
