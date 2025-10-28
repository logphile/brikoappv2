const { createClient } = require('@supabase/supabase-js');

module.exports.serverSupabase = function serverSupabase() {
  const url = process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NUXT_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) {
    const miss = [];
    if (!url) miss.push('NUXT_SUPABASE_URL/SUPABASE_URL');
    if (!key) miss.push('NUXT_SUPABASE_SERVICE_ROLE/SUPABASE_SERVICE_ROLE');
    const err = new Error('SUPABASE_ENV_MISSING: ' + miss.join(', '));
    err.code = 'CONFIG_MISSING';
    throw err;
  }
  return createClient(url, key, { auth: { persistSession: false } });
};
