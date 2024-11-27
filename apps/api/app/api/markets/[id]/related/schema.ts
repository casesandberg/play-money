import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: zod.object({ id: zod.string() }),
    responses: {
      200: zod.object({ markets: zod.array(MarketSchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
