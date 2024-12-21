import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { ApiKeySchema } from '@play-money/database'

export default {
  post: {
    requestBody: z.object({
      name: z.string(),
    }),
    responses: {
      200: ApiKeySchema,
      401: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  get: {
    responses: {
      200: z.object({ keys: z.array(ApiKeySchema) }),
      401: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
