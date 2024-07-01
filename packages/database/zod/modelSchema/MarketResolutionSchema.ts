import { z } from 'zod';

/////////////////////////////////////////
// MARKET RESOLUTION SCHEMA
/////////////////////////////////////////

export const MarketResolutionSchema = z.object({
  id: z.string().cuid(),
  marketId: z.string(),
  resolvedById: z.string(),
  resolutionId: z.string(),
  supportingLink: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketResolution = z.infer<typeof MarketResolutionSchema>

export default MarketResolutionSchema;
