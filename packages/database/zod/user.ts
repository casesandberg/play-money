import * as z from "zod"
import { CompleteAccount, AccountModel, CompleteSession, SessionModel, CompleteComment, CommentModel, CompleteCommentReaction, CommentReactionModel } from "./index"
import { CompleteAccount, AccountModel, CompleteSession, SessionModel, CompleteMarket, MarketModel } from "./index"

export const _UserModel = z.object({
  id: z.string(),
  email: z.string().min(1, "Email is required").email(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
  twitterHandle: z.string().nullish(),
  discordHandle: z.string().nullish(),
  website: z.string().nullish(),
  bio: z.string().nullish(),
  emailVerified: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
  comments: CompleteComment[]
  commentReactions: CompleteCommentReaction[]
  markets: CompleteMarket[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  accounts: AccountModel.array(),
  sessions: SessionModel.array(),
  comments: CommentModel.array(),
  commentReactions: CommentReactionModel.array(),
  markets: MarketModel.array(),
}))
