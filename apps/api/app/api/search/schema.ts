import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    parameters: zod.object({ query: zod.string().optional() }),
    responses: {
      200: zod.object({ users: zod.array(UserProfileModel), markets: zod.array(MarketSchema) }),
      500: ServerErrorSchema,
    },
  },
})
