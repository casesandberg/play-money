import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// MARKET OPTION POSITION SCHEMA
/////////////////////////////////////////

export const MarketOptionPositionSchema = z.object({
  id: z.string().cuid(),
  accountId: z.string(),
  marketId: z.string(),
  optionId: z.string(),
  cost: z.instanceof(Prisma.Decimal, { message: "Field 'cost' must be a Decimal. Location: ['Models', 'MarketOptionPosition']"}),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'MarketOptionPosition']"}),
  value: z.instanceof(Prisma.Decimal, { message: "Field 'value' must be a Decimal. Location: ['Models', 'MarketOptionPosition']"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketOptionPosition = z.infer<typeof MarketOptionPositionSchema>

export default MarketOptionPositionSchema;
