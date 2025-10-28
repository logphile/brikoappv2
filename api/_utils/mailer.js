const nodemailer = require('nodemailer');

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const miss = [];
    if (!host) miss.push('SMTP_HOST');
    if (!user) miss.push('SMTP_USER');
    if (!pass) miss.push('SMTP_PASS');
    const e = new Error('SMTP_CONFIG_MISSING: ' + miss.join(', '));
    e.code = 'SMTP_CONFIG_MISSING';
    throw e;
  }

  const t = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

  // Optional per-message DKIM (only if you add keys later)
  // const dkim = process.env.DKIM_PRIVATE_KEY && process.env.DKIM_DOMAIN && process.env.DKIM_SELECTOR
  //   ? { domainName: process.env.DKIM_DOMAIN, keySelector: process.env.DKIM_SELECTOR, privateKey: process.env.DKIM_PRIVATE_KEY }
  //   : null;

  return t;
}

function fromAddress() {
  // e.g. "Briko <phil@briko.app>"
  return process.env.SUBSCRIBE_FROM || process.env.SMTP_USER;
}

module.exports = { buildTransport, fromAddress };
