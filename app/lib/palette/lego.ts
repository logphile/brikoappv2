export type PaletteColor = { name:string; hex:string; rgb:[number,number,number]; price_1x1:number }
export const legoPalette: PaletteColor[] = [
  { name:'Black',           hex:'#1B1B1B', rgb:[27,27,27],   price_1x1:0.03 },
  { name:'White',           hex:'#F4F4F4', rgb:[244,244,244],price_1x1:0.03 },
  { name:'Light Bluish Gray', hex:'#A3A3A3', rgb:[163,163,163], price_1x1:0.03 },
  { name:'Dark Bluish Gray',  hex:'#6D6E6E', rgb:[109,110,110], price_1x1:0.03 },
  { name:'Red',             hex:'#C91A09', rgb:[201,26,9],   price_1x1:0.03 },
  { name:'Blue',            hex:'#0055BF', rgb:[0,85,191],   price_1x1:0.03 },
  { name:'Green',           hex:'#237841', rgb:[35,120,65],  price_1x1:0.03 },
  { name:'Bright Light Orange', hex:'#F8BB3D', rgb:[248,187,61], price_1x1:0.03 },
  { name:'Yellow',          hex:'#F2CD37', rgb:[242,205,55], price_1x1:0.03 },
  { name:'Dark Tan',        hex:'#958A73', rgb:[149,138,115],price_1x1:0.03 },
  { name:'Reddish Brown',   hex:'#582A12', rgb:[88,42,18],   price_1x1:0.04 },
  { name:'Tan',             hex:'#E4CD9E', rgb:[228,205,158],price_1x1:0.03 },
  { name:'Orange',          hex:'#FE8A18', rgb:[254,138,24], price_1x1:0.03 },
  { name:'Bright Pink',     hex:'#FF4F9A', rgb:[255,79,154], price_1x1:0.04 },
  { name:'Purple',          hex:'#81007B', rgb:[129,0,123],  price_1x1:0.04 },
  // Added portrait-friendly tones
  { name:'Light Nougat',   hex:'#F6D7B3', rgb:[246,215,179], price_1x1:0.04 },
  { name:'Medium Nougat',  hex:'#AA7D55', rgb:[170,125,85],  price_1x1:0.04 },
  { name:'Dark Orange',    hex:'#A95500', rgb:[169,85,0],    price_1x1:0.04 },
  { name:'Dark Brown',     hex:'#4C1E10', rgb:[76,30,16],    price_1x1:0.05 },
  { name:'Sand Green',     hex:'#A0BCAC', rgb:[160,188,172], price_1x1:0.04 },
  { name:'Sand Blue',      hex:'#6C8092', rgb:[108,128,146], price_1x1:0.04 },
  { name:'Dark Red',       hex:'#7F1010', rgb:[127,16,16],   price_1x1:0.04 },
  { name:'Dark Blue',      hex:'#001D5F', rgb:[0,29,95],     price_1x1:0.04 },
  { name:'Bright Light Blue', hex:'#9CD7F7', rgb:[156,215,247], price_1x1:0.04 }
]
