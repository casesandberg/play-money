import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketActivitySchema } from '@play-money/markets/types'

export default createSchema({
  GET: {
    responses: {
      200: zod.object({ activities: zod.array(MarketActivitySchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})