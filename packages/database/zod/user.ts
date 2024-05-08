import * as z from "zod"
import { CompleteAccount, AccountModel, CompleteSession, SessionModel } from "./index"

export const _UserModel = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().min(1, "Email is required").email(),
  username: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters").max(32, "Password may only be a max of 32 characters"),
  avatarUrl: z.string().nullish(),
  emailVerified: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  accounts: AccountModel.array(),
  sessions: SessionModel.array(),
}))
