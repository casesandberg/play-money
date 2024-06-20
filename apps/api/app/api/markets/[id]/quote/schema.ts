import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  post: {
    parameters: z.object({ id: z.string() }),
    requestBody: z.object({ optionId: z.string(), amount: z.number() }),
    responses: {
      200: z.object({
        newProbability: z.number(),
        potentialReturn: z.number(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
