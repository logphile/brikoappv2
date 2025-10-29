const { serverSupabase } = require('../_utils/supa');
const { keyRole } = require('../_utils/keyRole');
const { buildTransport, fromAddress } = require('../_utils/mailer');
const { readEmailPng } = require('../_utils/emailAssets');

// CID-embedded logo config
const LOGO_CID = 'briko-logo';
const LOGO_FILE = 'briko-logo-20251029.png';
const LOGO_URL = process.env.BRIKO_LOGO_URL || 'https://briko.app/email/briko-logo-20251029.png';

async function loadLogoBuffer(context) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(LOGO_URL, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error('HTTP_' + res.status);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (e) {
    context.log && context.log.warn && context.log.warn('[subscribe] logo_fetch_failed', LOGO_URL, e && (e.message || e));
    return null;
  }
}

// Inline HTML template, now referencing CID for the logo
const WELCOME_HTML = `<!DOCTYPE html><html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta http-equiv="x-ua-compatible" content="ie=edge"/><title>Welcome to Briko</title><style>body,table,td,p{margin:0;padding:0}img{border:0;outline:0;text-decoration:none;display:block}table{border-collapse:collapse}a{text-decoration:none}.bg-paper{background:#F5F4F1}.bg-yellow{background:#FFD808}.ink{color:#343434}.muted{color:#666}.wrap{width:100%}.container{width:100%;max-width:600px;margin:0 auto}.card{border-radius:12px;overflow:hidden}.px{padding-left:24px;padding-right:24px}.py{padding-top:24px;padding-bottom:24px}.pt{padding-top:24px}.btn{background:#FF0062;color:#fff!important;font-weight:700;border-radius:10px}.btn-txt{font-size:16px;line-height:16px;padding:14px 22px;display:inline-block}.system-font{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}.h1{font-size:32px;line-height:1.15;font-weight:900;letter-spacing:.2px}.p{font-size:16px;line-height:1.55}.small{font-size:12px;line-height:1.4}@media (max-width:620px){.px{padding-left:16px!important;padding-right:16px!important}.py{padding-top:20px!important;padding-bottom:20px!important}.h1{font-size:28px!important}}</style></head><body class="bg-paper system-font"><center class="wrap"><table width="100%" role="presentation"><tr><td height="28">&nbsp;</td></tr></table><table role="presentation" class="container card" width="600" align="center"><tr><td class="bg-yellow px py"><table role="presentation" width="100%"><tr><td align="left" valign="middle"><div class="h1 ink system-font" style="font-weight:900;">WELCOME TO<br><span style="font-size:40px;">BRIKO!</span></div></td><td align="right" valign="middle" style="width:120px;"><img src="cid:${LOGO_CID}" width="96" height="96" alt="Briko icon" style="width:96px;height:96px"></td></tr></table><table role="presentation" width="100%" style="margin-top:18px;margin-bottom:18px"><tr><td style="height:2px;background:#FF0062;border-radius:2px"></td></tr></table><table role="presentation" width="100%"><tr><td class="ink system-font p"><p class="p">Hey there 👋</p><p class="p" style="margin-top:10px">Thanks for joining <strong>Briko</strong>. You’re officially on the list for new builds, features, and parts packs.</p></td></tr></table><table role="presentation" align="left" style="margin-top:14px;margin-bottom:10px"><tr><td><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://briko.app" arcsize="12%" fillcolor="#FF0062" stroke="f"><w:anchorlock/><center style="color:#ffffff;font-family:Segoe UI, Arial, sans-serif;font-size:16px;font-weight:700;">Visit Briko</center></v:roundrect><![endif]--><!--[if !mso]><!-- --><a class="btn btn-txt system-font" href="https://briko.app" target="_blank">Visit Briko</a><!--<![endif]--></td></tr></table><table role="presentation" width="100%"><tr><td class="pt ink system-font p">— The Briko Team</td></tr></table></td></tr></table><table role="presentation" class="container" width="600" align="center" style="margin-top:16px"><tr><td align="center" class="small muted system-font">© 2025 Briko · <a href="https://briko.app" class="muted" style="color:#666">briko.app</a></td></tr></table><table width="100%" role="presentation"><tr><td height="28">&nbsp;</td></tr></table></center></body></html>`;

// Normalized email validator
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonRes(context, status, body, headers = {}) {
  context.res = {
    status,
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  };
}

function renderWelcomeHtml(logoSrc) {
  try {
    return WELCOME_HTML.replace('cid:' + LOGO_CID, logoSrc);
  } catch (_) {
    return WELCOME_HTML;
  }
}

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
    // Normalize request body
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const raw = (body.email || '').toString();
    const email = raw.trim().toLowerCase();
    const source = (body.source || 'site').slice(0, 64);

    // Cheap guardrails
    if (!email || !EMAIL_RE.test(email)) {
      context.res = {
        status: 400,
        headers: { 'content-type': 'application/json', 'x-briko-reason': 'bad_email' },
        body: JSON.stringify({ ok: false, reason: 'bad_email' })
      };
      return;
    }
    if (role !== 'service_role') {
      context.log.error('[subscribe] WRONG_KEY role=', role);
      jsonRes(context, 500, { ok:false, code:'WRONG_KEY' }, { 'x-key-role': role });
      return;
    }

    // Idempotent UPSERT using service role
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } }
    );

    // Pre-check existence for diagnostic and to gate welcome/admin send
    let existed = null;
    try {
      const chk = await supabase
        .from('subscriptions').select('email').eq('email', email).maybeSingle();
      existed = !!chk.data;
    } catch (_) {}

    let data, error;
    ({ data, error } = await supabase
      .from('subscriptions')
      .upsert({ email, source }, { onConflict: 'email', returning: 'representation' })
      .select('email, created_at')
      .maybeSingle()
    );

    if ((error && error.code === 'PGRST204') || (!data && !error)) {
      const check = await supabase
        .from('subscriptions')
        .select('email, created_at')
        .eq('email', email)
        .maybeSingle();
      if (check.data) { data = check.data; error = null; }
    }

    if (error) {
      const isDup = (error.code === '23505');
      context.res = {
        status: isDup ? 409 : 500,
        headers: {
          'content-type': 'application/json',
          ...hdrs,
          'x-briko-dbcode': error.code || 'n/a',
          'x-briko-reason': isDup ? 'duplicate' : 'db_error'
        },
        body: JSON.stringify({ ok:false, reason: isDup ? 'duplicate' : 'db_error', code: error.code, msg: error.message })
      };
      return;
    }

    const newlyAdded = (existed === false);
    hdrs['x-briko-new'] = String(newlyAdded);

    let sent = [];
    if (newlyAdded) {
      // Send emails (awaited) on first insert only, with soft timeouts
      try {
        const t = buildTransport();

        const withTimeout = (p, ms = 6000) => Promise.race([
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
          let logoBuf = null;
          try {
            logoBuf = readEmailPng(LOGO_FILE);
          } catch (_) {
            try { logoBuf = await loadLogoBuffer(context); } catch (_) {}
          }

          const mailOpts = {
            from: fromAddress(),
            to: email,
            subject: 'Welcome to Briko 🧱',
            text: 'Thanks for joining Briko. You’re on the list for new builds, features, and parts packs. Visit https://briko.app',
            html: renderWelcomeHtml(logoBuf ? ('cid:' + LOGO_CID) : LOGO_URL),
            headers: { 'X-Entity-Ref-ID': 'briko-subscribe-welcome' }
          };

          if (logoBuf) {
            mailOpts.attachments = [{
              filename: LOGO_FILE,
              content: logoBuf,
              cid: LOGO_CID,
              contentType: 'image/png'
            }];
          }

          await withTimeout(t.sendMail(mailOpts));
          sent.push('welcome');
        }
      } catch (mailErr) {
        context.log.error('[subscribe] MAIL_ERROR', mailErr && (mailErr.message || mailErr));
        // do not fail the request; continue to return 200
      }
    }
    if (sent.length) hdrs['x-briko-mail-sent'] = sent.join(',');

    // duplicates count as success
    context.res = {
      status: 200,
      headers: { 'content-type': 'application/json', ...hdrs },
      body: JSON.stringify({ ok: true })
    };
    return;
  } catch (e) {
    context.log.error('[subscribe] UNHANDLED', e && (e.stack || e.message || e));
    const code = e && e.code ? e.code : 'UNKNOWN';
    jsonRes(context, 500, { ok:false, code }, { 'x-key-role': role });
    return;
  }
};

// Export template for reuse (e.g., mail-selftest HTML mode)
module.exports.WELCOME_HTML = WELCOME_HTML;
