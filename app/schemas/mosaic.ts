import { z } from 'zod'

export const MosaicSettingsSchema = z.object({
  width: z.number().int().min(8).max(512),
  height: z.number().int().min(8).max(512),
  allowedParts: z.array(z.string().regex(/^\d+x\d+$/)).nonempty(),
  snapOrientation: z.enum(["both", "horizontal", "vertical"]),
  seed: z.number().optional()
})

export type MosaicSettingsInput = z.infer<typeof MosaicSettingsSchema>
