export type PaletteItem = { name: string; hex: string };

export type StepCell = {
  col: number; row: number; colorHex: string;
};

export type ProjectOverviewCtx = {
  cols: number; rows: number;
  widthIn: number; heightIn: number;
  widthCm: number; heightCm: number;
  totalBricks: number; distinctColors: number;
  estimateUSD?: number;
  palette: PaletteItem[];

  originalImg: string;                  // dataURL ("data:image/jpeg;base64,...") or PNG
  originalType: "PNG" | "JPEG";
  originalImgW: number; originalImgH: number;
};

export type BuildGuideCtx = ProjectOverviewCtx & {
  steps: StepCell[][];
  nameFromHex: (hex: string) => string;
  bom: Array<{ partLabel: string; colorName: string; qty: number; estimate?: number }>;
  pageFormat?: "letter" | "a4";
  inkSaver?: boolean;
};
