import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  post: {
    parameters: z.object({ id: z.string() }),
    requestBody: z.object({ optionId: z.string(), amount: z.number(), isBuy: z.boolean().optional() }),
    responses: {
      200: z.object({
        newProbability: z.number(),
        potentialReturn: z.number(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
