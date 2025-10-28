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

  // Track flags for instrumentation
  const hdrs = {
    'x-key-role': role,
    'x-briko-notify-present': String(!!notifyTo),
    'x-briko-welcome-on': String(welcomeOn),
    'x-briko-template': String(!!WELCOME_HTML),
    'x-briko-new': 'unknown',
    'x-briko-mail-sent': 'none'
  };

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
    hdrs['x-briko-new'] = String(!exists);

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

    let sent = [];
    if (inserted) {
      // Send emails (awaited) on first insert only, with soft timeouts
      try {
        const t = buildTransport();

        const withTimeout = (p, ms = 3000) => Promise.race([
          p,
          new Promise((_, rej) => setTimeout(() => rej(new Error('MAIL_TIMEOUT')), ms))
        ]);

        if (notifyTo) {
          await withTimeout(t.sendMail({
            from: fromAddress(),
            to: notifyTo,
            subject: 'New Briko subscriber',
            text: `New subscriber: ${email}`,
            html: `<div style="font:14px system-ui,-apple-system,Segoe UI,Roboto">New subscriber: <b>${email}</b></div>`
          }));
          sent.push('admin');
        }

        if (welcomeOn && WELCOME_HTML) {
          await withTimeout(t.sendMail({
            from: fromAddress(),
            to: email,
            subject: 'Welcome to Briko 💛',
            text: 'Thanks for joining Briko. You’re on the list for new builds, features, and parts packs. Visit https://briko.app',
            html: WELCOME_HTML,
            headers: { 'X-Entity-Ref-ID': 'briko-subscribe-welcome' }
          }));
          sent.push('welcome');
        }
      } catch (mailErr) {
        context.log.error('[subscribe] MAIL_ERROR', mailErr && (mailErr.message || mailErr));
        // do not fail the request; continue to return 200
      }
    }
    if (sent.length) hdrs['x-briko-mail-sent'] = sent.join(',');

    // duplicates count as success
    return {
      status: 200,
      headers: { 'content-type': 'application/json', ...hdrs },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    context.log.error('[subscribe] UNHANDLED', e && (e.stack || e.message || e));
    const code = e && e.code ? e.code : 'UNKNOWN';
    return json(500, { ok:false, code }, { 'x-key-role': role });
  }
};
