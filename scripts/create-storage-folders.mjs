import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  BUCKET = 'projects',
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TIMEOUT_MS = parseInt(process.env.SB_TIMEOUT_MS || '20000', 10);

// Wrap fetch with a timeout to avoid hanging indefinitely
const fetchWithTimeout = async (resource, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(resource, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: fetchWithTimeout },
});

/**
 * For each user_projects.preview_path (e.g.
 * 'projects/<userId>/<projectId>/preview.png')
 * create a placeholder object at
 * '<userId>/<projectId>/.keep' inside the bucket.
 */
async function main() {
  console.log(`Using Supabase at ${SUPABASE_URL}`);
  console.log(`Target bucket: ${BUCKET}`);

  // 1) Pull preview path values with robust fallbacks
  let data = null;
  let error = null;

  // Attempt A: user_projects + status filter
  let res = await supabase
    .from('user_projects')
    .select('preview_path, original_preview_path, status')
    .eq('status', 'public');
  data = res.data; error = res.error;

  // Attempt B: user_projects without status if column missing
  if (error && (error.code === '42703' || /column\s+"?status"?\s+does not exist/i.test(error.message))) {
    console.warn('Status column missing on user_projects; falling back to selecting without filter.');
    res = await supabase
      .from('user_projects')
      .select('preview_path, original_preview_path');
    data = res.data; error = res.error;
  }

  // Attempt C: user_projects_public view
  if (error && (error.code === '42P01' || /relation\s+"?user_projects"?\s+does not exist/i.test(error.message))) {
    console.warn('user_projects table not found; trying user_projects_public view.');
    res = await supabase
      .from('user_projects_public')
      .select('preview_path, original_preview_path');
    data = res.data; error = res.error;
  }

  if (error) {
    console.error('Failed to fetch preview path rows:', error);
    process.exit(1);
  }

  const uniquePrefixes = Array.from(
    new Set(
      (data || [])
        .flatMap((r) => {
          const candidates = [];
          if (typeof r.preview_path === 'string') candidates.push(r.preview_path);
          // Some environments use a small public original preview path
          if (typeof r.original_preview_path === 'string') candidates.push(r.original_preview_path);
          // In case of any array-style paths (defensive)
          if (Array.isArray(r.preview_paths)) candidates.push(...r.preview_paths);
          return candidates;
        })
        // remove leading 'projects/' (bucket name) and trailing '/<file>.(png|webp|jpg)'
        .map((p) =>
          typeof p === 'string'
            ? p
                .replace(/^projects\//, '')
                .replace(/\/[^/]+\.(png|webp|jpe?g)$/i, '')
            : ''
        )
        .filter(Boolean)
    )
  );

  console.log(`Preparing ${uniquePrefixes.length} folder(s):`);
  uniquePrefixes.forEach((p) => console.log('  -', p));

  // 2) Upload a small placeholder file per prefix
  for (const prefix of uniquePrefixes) {
    const objectName = `${prefix}/.keep`; // inside bucket, no 'projects/' prefix
    const content = Buffer.from('seed');

    // upsert will overwrite if it already exists
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(objectName, content, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (upErr) {
      console.error(`❌ ${objectName}`, upErr.message);
    } else {
      console.log(`✅ ${objectName}`);
    }
  }

  console.log('Done. Now upload each preview.png into its matching folder.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
