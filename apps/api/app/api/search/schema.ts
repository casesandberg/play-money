import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema, UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: zod.object({ query: zod.string().optional() }),
    responses: {
      200: zod.object({ users: zod.array(UserSchema), markets: zod.array(MarketSchema) }),
      500: ServerErrorSchema,
    },
  },
})
