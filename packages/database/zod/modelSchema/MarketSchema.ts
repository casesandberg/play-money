import { z } from 'zod';

/////////////////////////////////////////
// MARKET SCHEMA
/////////////////////////////////////////

export const MarketSchema = z.object({
  id: z.string().cuid(),
  question: z.string().min(1, { message: "Question is required" }),
  description: z.string(),
  slug: z.string().min(1, { message: "Slug is required" }),
  closeDate: z.coerce.date().nullable(),
  resolvedAt: z.coerce.date().nullable(),
  createdBy: z.string(),
  ammAccountId: z.string().nullable(),
  clearingAccountId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Market = z.infer<typeof MarketSchema>

export default MarketSchema;
