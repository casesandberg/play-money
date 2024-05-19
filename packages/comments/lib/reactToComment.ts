import { z } from 'zod'
import db, { _CommentModel, _CommentReactionModel, _UserModel } from '@play-money/database'

export const CreateSchema = _CommentReactionModel.pick({
  emoji: true,
  userId: true,
  commentId: true,
})

export async function reactToComment(data: z.infer<typeof CreateSchema>) {
  const { emoji, userId, commentId } = CreateSchema.parse(data)

  const existingReaction = await db.commentReaction.findFirst({
    where: {
      emoji,
      userId,
      commentId,
    },
  })

  if (existingReaction) {
    await db.commentReaction.delete({
      where: {
        id: existingReaction.id,
      },
    })

    return 'removed'
  }

  const reaction = await db.commentReaction.create({
    data: {
      emoji,
      userId,
      commentId,
    },
  })

  return reaction
}
