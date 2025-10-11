// Centralized offline Iconify icons for homepage
// Material Symbols (rounded)
import cloudUpload from '@iconify-icons/material-symbols/cloud-upload-rounded'
import gridOn from '@iconify-icons/material-symbols/grid-on-rounded'
import requestQuote from '@iconify-icons/material-symbols/request-quote-rounded'
import gridView from '@iconify-icons/material-symbols/grid-view-rounded'
import viewInAr from '@iconify-icons/material-symbols/view-in-ar-rounded'
import receiptLong from '@iconify-icons/material-symbols/receipt-long-rounded'
import fileDownload from '@iconify-icons/material-symbols/file-download-rounded'
import share from '@iconify-icons/material-symbols/share-rounded'
import bolt from '@iconify-icons/material-symbols/bolt-rounded'

export const homeIcons = {
  hero: {
    cloudUpload,
    gridOn,
    requestQuote,
  },
  features: {
    mosaic: gridView,
    voxel: viewInAr,
    bom: receiptLong, // more reliable than "receipts-rounded"
    export: fileDownload,
    save: share,
    perf: bolt,
  },
} as const
