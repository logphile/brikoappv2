// Build-time imports from unplugin-icons; these WILL fail the build if misspelled.
import Upload from '~icons/material-symbols/upload-rounded'
import Tune from '~icons/material-symbols/tune-rounded'
import AutoAwesome from '~icons/material-symbols/auto-awesome-rounded'

import Bolt from '~icons/material-symbols/bolt-rounded'
import Palette from '~icons/material-symbols/palette'
import Photo from '~icons/material-symbols/photo-rounded'
import Layers from '~icons/material-symbols/layers-rounded'
import Download from '~icons/material-symbols/download-rounded'
import ReceiptLong from '~icons/material-symbols/receipt-long-rounded'

export const HomeIcons = {
  upload: Upload,
  tune: Tune,
  auto: AutoAwesome,
  bolt: Bolt,
  palette: Palette,
  photo: Photo,
  layers: Layers,
  download: Download,
  receipt: ReceiptLong,
} as const

// Keep tree-shaking honest in case of “imported but not used” during generate
export const __ICONS_OK__ = Object.values(HomeIcons)
