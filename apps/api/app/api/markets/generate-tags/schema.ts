import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  post: {
    requestBody: z.object({ question: z.string() }),
    responses: {
      200: z.object({
        tags: z.array(z.string()),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
