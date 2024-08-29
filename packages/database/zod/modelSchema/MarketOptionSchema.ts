import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// MARKET OPTION SCHEMA
/////////////////////////////////////////

export const MarketOptionSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, { message: "Name is required" }),
  marketId: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  liquidityProbability: z.instanceof(Prisma.Decimal, { message: "Field 'liquidityProbability' must be a Decimal. Location: ['Models', 'MarketOption']"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketOption = z.infer<typeof MarketOptionSchema>

export default MarketOptionSchema;
