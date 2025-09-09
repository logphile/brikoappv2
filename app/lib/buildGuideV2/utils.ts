export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3
    ? parseInt(h.split("").map(c => c + c).join(""), 16)
    : parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function fitRect(srcW: number, srcH: number, maxW: number, maxH: number) {
  const r = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.floor(srcW * r), h: Math.floor(srcH * r) };
}

export function truncatePdf(pdf: any, text: string, maxW: number): string {
  if ((pdf as any).getTextWidth && (pdf as any).getTextWidth(text) <= maxW) return text;
  let s = text;
  while (s.length > 1 && (pdf as any).getTextWidth(s + "…") > maxW) s = s.slice(0, -1);
  return s + "…";
}

export async function urlToDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
