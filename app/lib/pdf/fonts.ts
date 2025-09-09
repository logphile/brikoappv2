// Font registration for jsPDF using embedded base64 TTFs
// NOTE: You must add the font files at the specified paths.
// - app/assets/fonts/Outfit-Regular.ttf
// - app/assets/fonts/Outfit-SemiBold.ttf
// - app/assets/fonts/Outfit-ExtraBold.ttf
// Each is imported with ?base64 so Vite inlines them as base64 strings.

import OutfitRegular from '@/assets/fonts/Outfit-Regular.ttf?base64'
import OutfitSemi from '@/assets/fonts/Outfit-SemiBold.ttf?base64'
import OutfitHeavy from '@/assets/fonts/Outfit-ExtraBold.ttf?base64'

export function registerOutfit(pdf: any) {
  pdf.addFileToVFS('Outfit-Regular.ttf', OutfitRegular)
  pdf.addFileToVFS('Outfit-SemiBold.ttf', OutfitSemi)
  pdf.addFileToVFS('Outfit-ExtraBold.ttf', OutfitHeavy)
  pdf.addFont('Outfit-Regular.ttf', 'Outfit', 'normal')
  pdf.addFont('Outfit-SemiBold.ttf', 'Outfit', 'bold')
  pdf.addFont('Outfit-ExtraBold.ttf', 'Outfit', 'heavy')
}
