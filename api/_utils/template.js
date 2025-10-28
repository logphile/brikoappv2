const fs = require('fs');
const path = require('path');

const _cache = new Map();
function loadTemplate(relPath) {
  if (_cache.has(relPath)) return _cache.get(relPath);
  const abs = path.join(__dirname, '..', relPath);
  const html = fs.readFileSync(abs, 'utf8');
  _cache.set(relPath, html);
  return html;
}
module.exports = { loadTemplate };
