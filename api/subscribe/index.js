const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');
const { buildTransport, fromAddress } = require('../_utils/mailer');
const { loadTemplate } = require('../_utils/template');

function json(status, body, extraHeaders = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body)
  };
}

const WELCOME_HTML = (() => {
  try { return loadTemplate('_templates/briko-welcome.html'); }
  catch { return null; }
})();

module.exports = async function (context, req) {
  const svc = process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  const role = keyRole(svc);
  const welcomeOn = String(process.env.WELCOME_EMAIL_ENABLED || 'false').toLowerCase() === 'true';
  const notifyTo = process.env.SUBSCRIBE_NOTIFY_TO;

  try {
    const email = (req.body && req.body.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(422, { ok:false, code:'INVALID_EMAIL' }, { 'x-key-role': role });
    }
    if (role !== 'service_role') {
      context.log.error('[subscribe] WRONG_KEY role=', role);
      return json(500, { ok:false, code:'WRONG_KEY' }, { 'x-key-role': role });
    }

    const supa = serverSupabase();

    // check existence first to know if it's a new row
    const { data: exists, error: selErr } = await supa
      .from('subscriptions').select('email').eq('email', email).maybeSingle();
    if (selErr) {
      context.log.error('[subscribe] DB_SELECT_ERROR', selErr.message);
      return json(409, { ok:false, code:'DB', message: selErr.message }, { 'x-key-role': role });
    }

    let inserted = false;
    if (!exists) {
      const { error: insErr } = await supa
        .from('subscriptions').insert({ email, source:'site' });
      if (insErr) {
        context.log.error('[subscribe] DB_INSERT_ERROR', insErr.message);
        return json(409, { ok:false, code:'DB', message: insErr.message }, { 'x-key-role': role });
      }
      inserted = true;
    }

    if (inserted) {
      // Fire-and-forget send; do not block response
      (async () => {
        try {
          const t = buildTransport();
          if (notifyTo) {
            await t.sendMail({
              from: fromAddress(),
              to: notifyTo,
              subject: 'New Briko subscriber',
              text: `New subscriber: ${email}`,
              html: `<div style="font:14px system-ui,-apple-system,Segoe UI,Roboto">New subscriber: <b>${email}</b></div>`
            });
          }
          if (welcomeOn && WELCOME_HTML) {
            await t.sendMail({
              from: fromAddress(),
              to: email,
              subject: 'Welcome to Briko 💛',
              text: 'Thanks for joining Briko. You’re on the list for new builds, features, and parts packs. Visit https://briko.app',
              html: WELCOME_HTML,
              headers: { 'X-Entity-Ref-ID': 'briko-subscribe-welcome' }
            });
          }
        } catch (mailErr) {
          context.log.error('[subscribe] MAIL_ERROR', mailErr && (mailErr.message || mailErr));
        }
      })();
    }

    // duplicates count as success
    return json(200, { ok:true }, { 'x-key-role': role });
  } catch (e) {
    context.log.error('[subscribe] UNHANDLED', e && (e.stack || e.message || e));
    const code = e && e.code ? e.code : 'UNKNOWN';
    return json(500, { ok:false, code }, { 'x-key-role': role });
  }
};
