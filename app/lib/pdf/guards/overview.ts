export const isOverviewLocked = (doc: any) => Boolean((doc as any)?.__overview_locked);

export function patchTextGuard(doc: any) {
  if ((doc as any).__textGuardPatched) return;
  (doc as any).__textGuardPatched = true;

  const origText = doc.text?.bind(doc);
  if (typeof origText !== 'function') return;

  doc.text = function guardedText(txt: any, ...rest: any[]) {
    const s = String(txt ?? "");
    // While overview is locked, swallow old all-caps DIMENSIONS labels
    if ((doc as any).__overview_locked && /DIMENSIONS\s*\((INCHES|CENTIMETERS)\)/i.test(s)) {
      return this;
    }
    return origText(s, ...rest);
  };
}
