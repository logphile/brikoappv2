// Suggest mosaic dimensions (studs) based on image aspect and simple content stats
// - Line art: long side 64 studs
// - Photo: long side 48 studs
// - Preserve aspect ratio; round to even; clamp to minimum 16
export function suggestStuds(
  imgW: number,
  imgH: number,
  stats: { meanSat: number; edgeDensity: number }
){
  const ratio = imgW / Math.max(1, imgH)
  const isLineArt = stats.meanSat < 0.12 && stats.edgeDensity > 0.04
  const longSide = isLineArt ? 64 : 48
  const wIsLong = ratio >= 1
  let w = wIsLong ? longSide : Math.max(16, Math.round(longSide * ratio))
  let h = wIsLong ? Math.max(16, Math.round(longSide / Math.max(1, ratio))) : longSide
  // round to even so 2× bricks fit nicely
  w = Math.max(16, Math.round(w / 2) * 2)
  h = Math.max(16, Math.round(h / 2) * 2)
  return { w, h }
}
