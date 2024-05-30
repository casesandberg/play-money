import { z } from 'zod';

/////////////////////////////////////////
// CURRENCY SCHEMA
/////////////////////////////////////////

export const CurrencySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  symbol: z.string(),
  code: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Currency = z.infer<typeof CurrencySchema>

export default CurrencySchema;
