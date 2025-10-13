import IconUpload from '@/components/icons/IconUpload.vue'
import IconTune from '@/components/icons/IconTune.vue'
import IconAuto from '@/components/icons/IconAuto.vue'
import IconBolt from '@/components/icons/IconBolt.vue'
import IconPalette from '@/components/icons/IconPalette.vue'
import IconPhoto from '@/components/icons/IconPhoto.vue'
import IconLayers from '@/components/icons/IconLayers.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'

export const HomeIcons = {
  upload: IconUpload,
  tune: IconTune,
  auto: IconAuto,
  bolt: IconBolt,
  palette: IconPalette,
  photo: IconPhoto,
  layers: IconLayers,
  download: IconDownload,
  receipt: IconReceipt,
} as const

// Keep tree-shaking honest in case of “imported but not used” during generate
export const __ICONS_OK__ = Object.values(HomeIcons)
