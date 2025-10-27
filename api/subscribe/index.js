module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    }};
    return;
  }
  try {
    context.res = { status: 200, jsonBody: { ok: true, echo: req.body || null } };
  } catch (e) {
    context.res = { status: 500, jsonBody: { ok: false, error: String(e?.message || e) } };
  }
};
