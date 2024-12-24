import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { ApiKeySchema } from '@play-money/database'

export default {
  post: {
    summary: 'Create an API key',
    security: true,
    requestBody: z.object({
      name: z.string(),
    }),
    responses: {
      200: z.object({ data: ApiKeySchema }),
      401: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  get: {
    summary: 'Get all API keys for a user',
    security: true,
    responses: {
      200: z.object({ data: z.array(ApiKeySchema) }),
      401: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
