import { z } from 'zod'
import {
  ApiEndpoints,
  createPaginatedResponseSchema,
  paginationSchema,
  ServerErrorSchema,
  zodCoerceCSVToArray,
} from '@play-money/api-helpers'
import { ListSchema, MarketOptionSchema, MarketSchema, QuestionContributionPolicySchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get markets',
    parameters: z
      .object({
        status: z.enum(['active', 'halted', 'closed', 'resolved', 'canceled', 'all']).optional(),
        createdBy: z.string().optional(),
        tags: zodCoerceCSVToArray.optional(),
      })
      .merge(paginationSchema)
      .optional(),
    responses: {
      200: createPaginatedResponseSchema(MarketSchema),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  post: {
    summary: 'Create a market',
    security: true,
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
