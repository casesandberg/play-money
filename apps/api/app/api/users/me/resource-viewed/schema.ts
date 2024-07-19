import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  post: {
    requestBody: z.object({ resourceType: z.string(), resourceId: z.string(), timestamp: z.string() }),
    responses: {
      200: z.object({ success: z.boolean() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
