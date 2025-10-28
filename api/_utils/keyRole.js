module.exports.keyRole = function keyRole(key) {
  if (!key) return 'missing';
  try {
    const payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return json && json.role ? json.role : 'unknown';
  } catch { return 'unreadable'; }
};
