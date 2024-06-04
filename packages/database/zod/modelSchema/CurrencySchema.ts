import { z } from 'zod';
import { CurrencyCodeSchema } from '../inputTypeSchemas/CurrencyCodeSchema'

/////////////////////////////////////////
// CURRENCY SCHEMA
/////////////////////////////////////////

export const CurrencySchema = z.object({
  code: CurrencyCodeSchema,
  id: z.string().cuid(),
  name: z.string(),
  symbol: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Currency = z.infer<typeof CurrencySchema>

export default CurrencySchema;
