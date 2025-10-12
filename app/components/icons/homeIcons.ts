// Use JSON icons so SSR/prerender never fetches from network
import cloudUpload   from '@iconify-json/material-symbols/icons/cloud-upload-rounded.json'
import gridOn        from '@iconify-json/material-symbols/icons/grid-on-rounded.json'
import requestQuote  from '@iconify-json/material-symbols/icons/request-quote-rounded.json'

import gridView      from '@iconify-json/material-symbols/icons/grid-view-rounded.json'
import viewInAr      from '@iconify-json/material-symbols/icons/view-in-ar-rounded.json'
import receiptLong   from '@iconify-json/material-symbols/icons/receipt-long-rounded.json'
import fileDownload  from '@iconify-json/material-symbols/icons/file-download-rounded.json'
import share         from '@iconify-json/material-symbols/icons/share-rounded.json'
import bolt          from '@iconify-json/material-symbols/icons/bolt-rounded.json'

export const homeIcons = {
  hero: { cloudUpload, gridOn, requestQuote },
  features: {
    mosaic: gridView,
    voxel: viewInAr,
    bom: receiptLong,        // more reliable than "receipts-*"
    export: fileDownload,
    save: share,
    perf: bolt,
  },
}
