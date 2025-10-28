const { buildTransport, fromAddress } = require('../_utils/mailer');

module.exports = async function (context, req) {
  try {
    const to = (req.query && req.query.to) || process.env.SUBSCRIBE_NOTIFY_TO || process.env.SMTP_USER;
    const transport = buildTransport();
    const info = await transport.sendMail({
      from: fromAddress(),
      to,
      subject: 'Briko mail self-test',
      text: 'This is a self-test email from the Briko SWA function.'
    });
    context.res = { status: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, to, messageId: info.messageId }) };
  } catch (e) {
    context.log.error('[mail-selftest]', e && (e.message || e));
    context.res = { status: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
