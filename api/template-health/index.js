const { loadTemplate } = require('../_utils/template');

module.exports = async function (context, req) {
  let hasTemplate = false;
  let length = 0;
  try {
    const html = loadTemplate('_templates/briko-welcome.html');
    if (typeof html === 'string') {
      hasTemplate = true;
      length = html.length;
    }
  } catch (e) {
    // missing template is fine; we report hasTemplate=false
  }

  context.res = {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, hasTemplate, length })
  };
};
