module.exports = async function (context, req) {
  const ts = new Date().toISOString();
  const who = (req.query && req.query.who) || 'briko';

  context.res = {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-briko-echo': '1',
      'x-briko-ts': ts
    },
    body: JSON.stringify({ ok: true, who, ts })
  };
};
