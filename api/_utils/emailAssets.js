const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function readEmailPng(filename) {
  const candidates = [
    join(process.cwd(), 'public', 'email', filename),
    join(__dirname, '..', '..', 'public', 'email', filename),
    join(__dirname, '..', 'public', 'email', filename)
  ];

  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        return readFileSync(p);
      }
    } catch (_) {}
  }

  const err = new Error('EMAIL_ASSET_NOT_FOUND: ' + filename);
  err.code = 'EMAIL_ASSET_NOT_FOUND';
  throw err;
}

module.exports = { readEmailPng };
