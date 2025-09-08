export const copy = {
  mosaic: {
    title: 'Photo to Bricks',
    subtitle: 'Drop in a photo. Get a LEGO-style mosaic with a parts list and build steps.',
    steps: ['Upload a photo', 'Pick size & colors', 'Generate preview', 'Download parts & steps'],
    controls: {
      previewQuality: 'Preview quality',
      previewQualityHelp: 'Faster preview = fewer bricks. Detail = more bricks, sharper look.',
      outputSizeHelp: 'Bigger sizes use more bricks and show more detail.',
      showPlateOutlines: 'Show plate outlines',
      showPlateOutlinesHelp: 'Highlight where larger plates combine bricks.'
    },
    emptyState: 'Upload a photo to begin.',
    toasts: {
      generating: 'Building your mosaic…',
      regenerating: 'Updating preview…',
      exportReady: 'Export ready — saved to your downloads.'
    }
  },
  builder3d: {
    title: '3D Builder',
    subtitle: 'See your build in 3D. Rotate, zoom, and step through layers.',
    steps: ['Layer view', 'Free-spin 3D', 'One-click PDF'],
    controls: {
      layerSliderHelp: 'Slide to see each build layer.',
      lightingHelp: 'Switch lighting for clearer studs and edges.'
    }
  },
  avatar: {
    title: 'Brick Yourself',
    subtitle: 'Make a LEGO-style portrait from any selfie.',
    steps: ['Upload', 'Pick style', 'Download poster']
  },
  studio: {
    title: 'Your Projects',
    subtitle: 'Private by default. Make them public to share.',
    communityButton: 'Community Studio',
    communityButtonAria: 'See builds from the community.',
    communitySectionTitle: 'Community Projects',
    communitySubhead: 'Fresh builds from creators like you.',
    seeAll: 'See All',
    loadMore: 'Load More'
  }
} as const
