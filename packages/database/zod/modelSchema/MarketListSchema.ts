import { z } from 'zod';

/////////////////////////////////////////
// MARKET LIST SCHEMA
/////////////////////////////////////////

export const MarketListSchema = z.object({
  id: z.string().cuid(),
  listId: z.string(),
  marketId: z.string(),
  createdAt: z.coerce.date(),
})

export type MarketList = z.infer<typeof MarketListSchema>

export default MarketListSchema;
