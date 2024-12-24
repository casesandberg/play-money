import zod from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketActivitySchema } from '@play-money/markets/types'

export default {
  get: {
    summary: 'Get all site activity',
    responses: {
      200: zod.object({ data: zod.array(MarketActivitySchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
