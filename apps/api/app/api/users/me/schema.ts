import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'
import { UpdateSchema } from '@play-money/users/lib/updateUserById'

export default createSchema({
  GET: {
    // TODO: @casesandberg Fix typescript to allow for no request data
    request: {
      body: UpdateSchema,
    },
    response: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    request: {
      body: UpdateSchema,
    },
    response: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
