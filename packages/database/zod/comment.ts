import * as z from "zod"
import { CommentEntityType } from "@prisma/client"
import { CompleteUser, UserModel, CompleteCommentReaction, CommentReactionModel } from "./index"

export const _CommentModel = z.object({
  id: z.string(),
  content: z.string().min(1).max(5000),
  createdAt: z.date(),
  updatedAt: z.date().nullish(),
  edited: z.boolean(),
  authorId: z.string(),
  parentId: z.string().nullish(),
  hidden: z.boolean(),
  entityType: z.nativeEnum(CommentEntityType),
  entityId: z.string(),
})

export interface CompleteComment extends z.infer<typeof _CommentModel> {
  author: CompleteUser
  parent?: CompleteComment | null
  replies: CompleteComment[]
  reactions: CompleteCommentReaction[]
}

/**
 * CommentModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommentModel: z.ZodSchema<CompleteComment> = z.lazy(() => _CommentModel.extend({
  author: UserModel,
  parent: CommentModel.nullish(),
  replies: CommentModel.array(),
  reactions: CommentReactionModel.array(),
}))
