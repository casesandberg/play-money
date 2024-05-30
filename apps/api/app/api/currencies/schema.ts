import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CurrencySchema } from '@play-money/database'

export default createSchema({
  GET: {
    request: {
      params: zod.object({}),
    },
    response: {
      200: zod.object({ currencies: zod.array(CurrencySchema) }),
      500: ServerErrorSchema,
    },
  },
})
