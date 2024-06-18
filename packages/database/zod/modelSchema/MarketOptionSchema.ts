import { z } from 'zod';
import { CurrencyCodeSchema } from '../inputTypeSchemas/CurrencyCodeSchema'

/////////////////////////////////////////
// MARKET OPTION SCHEMA
/////////////////////////////////////////

export const MarketOptionSchema = z.object({
  currencyCode: CurrencyCodeSchema,
  id: z.string().cuid(),
  name: z.string(),
  marketId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketOption = z.infer<typeof MarketOptionSchema>

export default MarketOptionSchema;
