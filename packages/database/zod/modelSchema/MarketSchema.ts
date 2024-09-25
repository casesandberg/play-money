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
  tags: z.string().array().max(5),
  ammAccountId: z.string(),
  clearingAccountId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  commentCount: z.number().int().nullable(),
  uniqueTradersCount: z.number().int().nullable(),
  uniquePromotersCount: z.number().int().nullable(),
  liquidityCount: z.number().int().nullable(),
  parentListId: z.string().nullable(),
})

export type Market = z.infer<typeof MarketSchema>

export default MarketSchema;
