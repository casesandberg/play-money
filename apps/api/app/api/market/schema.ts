import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { _MarketModel } from '@play-money/database'

export default createSchema({
    POST: {
        request: {
            body: _MarketModel.omit({ id: true, resolvedAt: true, createdAt: true, updatedAt: true, createdBy: true, slug: true }),
        },
        response: {
            200: _MarketModel,
            404: ServerErrorSchema,
            500: ServerErrorSchema,
        },
    },
})
