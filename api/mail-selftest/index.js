const { buildTransport, fromAddress } = require('../_utils/mailer');
const { loadTemplate } = require('../_utils/template');

module.exports = async function (context, req) {
  try {
    const to = (req.query && req.query.to) || process.env.SUBSCRIBE_NOTIFY_TO || process.env.SMTP_USER;
    const mode = (req.query && req.query.mode) || 'text';
    const transport = buildTransport();

    let mail = {
      from: fromAddress(),
      to,
      subject: 'Briko mail self-test',
      text: 'This is a self-test email from the Briko SWA function.'
    };

    if (String(mode).toLowerCase() === 'html') {
      try {
        const html = loadTemplate('_templates/briko-welcome.html');
        if (html) {
          mail = {
            ...mail,
            subject: 'Briko mail self-test (HTML)',
            html
          };
        }
      } catch (_) { /* fall back to text */ }
    }

    const info = await transport.sendMail(mail);
    context.res = { status: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, to, mode, messageId: info.messageId }) };
  } catch (e) {
    context.log.error('[mail-selftest]', e && (e.message || e));
    context.res = { status: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
