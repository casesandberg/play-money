import * as z from "zod"
import { CompleteUser, UserModel } from "./index"

export const _SessionModel = z.object({
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteSession extends z.infer<typeof _SessionModel> {
  user: CompleteUser
}

/**
 * SessionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SessionModel: z.ZodSchema<CompleteSession> = z.lazy(() => _SessionModel.extend({
  user: UserModel,
}))
