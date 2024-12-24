import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get a market',
    parameters: MarketSchema.pick({ id: true }).extend({ extended: z.boolean().optional() }),
    responses: {
      200: z.object({ data: MarketSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    summary: 'Update a market',
    security: true,
    parameters: MarketSchema.pick({ id: true }),
    requestBody: MarketSchema.pick({
      question: true,
      description: true,
      closeDate: true,
      tags: true,
      createdBy: true,
    }).partial(),
    responses: {
      200: z.object({ data: MarketSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
