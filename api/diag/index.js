module.exports = async function (context, req) {
  const ts = new Date().toISOString();
  const who = (req.query && req.query.who) || 'briko';
  context.log('[diag] hit', { who, ts });

  context.res = {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-briko-diag': '1',
      'x-briko-ts': ts
    },
    body: JSON.stringify({ ok: true, who, ts })
  };
};
