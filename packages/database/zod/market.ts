import * as z from "zod"
import { CompleteUser, UserModel } from "./index"

export const _MarketModel = z.object({
  id: z.string(),
  question: z.string().min(1, "Question is required"),
  description: z.string(),
  slug: z.string().min(1, "Slug is required"),
  closeDate: z.date().nullish(),
  resolvedAt: z.date().nullish(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteMarket extends z.infer<typeof _MarketModel> {
  user: CompleteUser
}

/**
 * MarketModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const MarketModel: z.ZodSchema<CompleteMarket> = z.lazy(() => _MarketModel.extend({
  user: UserModel,
}))
