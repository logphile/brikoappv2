module.exports = async function (_ctx, req) {
  const ts = new Date().toISOString();
  const who = (req.query && req.query.who) || 'briko';
  return {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-briko-echo': '1',
      'x-briko-ts': ts
    },
    body: JSON.stringify({ ok: true, who, ts })
  };
};
