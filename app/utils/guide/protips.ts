export const PRO_TIPS = [
  'Build sub-clusters first; then place the cluster.',
  'If you lose your place, toggle plate outlines for this step.',
  'Align seams on even rows to avoid diagonal drift.',
  'Sort by color first—fastest for beginners.',
]

export function tipFor(step: number){
  return PRO_TIPS[(Math.floor(step / 6)) % PRO_TIPS.length]
}
