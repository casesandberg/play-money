import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { ListSchema, MarketOptionSchema, MarketSchema, QuestionContributionPolicySchema } from '@play-money/database'

export default {
  get: {
    parameters: z
      .object({
        status: z.enum(['active', 'halted', 'closed', 'resolved', 'canceled', 'all']).optional(),
        createdBy: z.string().optional(),
        pageSize: z.coerce.number().optional(),
        page: z.coerce.number().optional(),
        tag: z.string().optional(),
        sortField: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        markets: z.array(MarketSchema),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  post: {
    requestBody: MarketSchema.pick({
      question: true,
      description: true,
      closeDate: true,
      tags: true,
    }).extend({
      options: z.array(
        MarketOptionSchema.pick({
          name: true,
          color: true,
        })
      ),
      type: z.enum(['binary', 'multi', 'list']).optional(),
      contributionPolicy: QuestionContributionPolicySchema.optional(),
    }),
    responses: {
      200: z.object({ market: MarketSchema.optional(), list: ListSchema.optional() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
