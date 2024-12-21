import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default {
  get: {
    parameters: MarketSchema.pick({ id: true }).extend({ extended: z.boolean().optional() }),
    responses: {
      200: MarketSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    parameters: MarketSchema.pick({ id: true }),
    requestBody: MarketSchema.pick({ question: true, description: true, closeDate: true, tags: true }).partial(),
    responses: {
      200: MarketSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
