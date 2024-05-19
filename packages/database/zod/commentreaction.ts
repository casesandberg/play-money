import * as z from "zod"
import { CompleteUser, UserModel, CompleteComment, CommentModel } from "./index"

export const _CommentReactionModel = z.object({
  id: z.string(),
  emoji: z.string(),
  userId: z.string(),
  commentId: z.string(),
})

export interface CompleteCommentReaction extends z.infer<typeof _CommentReactionModel> {
  user: CompleteUser
  comment: CompleteComment
}

/**
 * CommentReactionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommentReactionModel: z.ZodSchema<CompleteCommentReaction> = z.lazy(() => _CommentReactionModel.extend({
  user: UserModel,
  comment: CommentModel,
}))
