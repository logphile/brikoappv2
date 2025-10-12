// Use JSON icons so SSR/prerender never fetches from network
import cloudUpload  from '@iconify-json/material-symbols/icons/cloud_upload_rounded.json'
import gridOn       from '@iconify-json/material-symbols/icons/grid_on_rounded.json'
import requestQuote from '@iconify-json/material-symbols/icons/request_quote_rounded.json'

import gridView     from '@iconify-json/material-symbols/icons/grid_view_rounded.json'
import viewInAr     from '@iconify-json/material-symbols/icons/view_in_ar_rounded.json'
import receiptLong  from '@iconify-json/material-symbols/icons/receipt_long_rounded.json'
import fileDownload from '@iconify-json/material-symbols/icons/file_download_rounded.json'
import share        from '@iconify-json/material-symbols/icons/share_rounded.json'
import bolt         from '@iconify-json/material-symbols/icons/bolt_rounded.json'

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
