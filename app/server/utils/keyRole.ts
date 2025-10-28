export function keyRole(key?: string) {
  if (!key) return 'missing';
  try {
    const payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return (json as any)?.role ?? 'unknown';
  } catch {
    return 'unreadable';
  }
}
