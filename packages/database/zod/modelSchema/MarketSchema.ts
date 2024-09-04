import { z } from 'zod';
import { Prisma } from '@prisma/client'

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
  commentCount: z.instanceof(Prisma.Decimal, { message: "Field 'commentCount' must be a Decimal. Location: ['Models', 'Market']"}).nullable(),
  uniqueTradersCount: z.instanceof(Prisma.Decimal, { message: "Field 'uniqueTradersCount' must be a Decimal. Location: ['Models', 'Market']"}).nullable(),
  uniquePromotersCount: z.instanceof(Prisma.Decimal, { message: "Field 'uniquePromotersCount' must be a Decimal. Location: ['Models', 'Market']"}).nullable(),
  liquidityCount: z.instanceof(Prisma.Decimal, { message: "Field 'liquidityCount' must be a Decimal. Location: ['Models', 'Market']"}).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Market = z.infer<typeof MarketSchema>

export default MarketSchema;
