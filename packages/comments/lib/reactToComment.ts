import { z } from 'zod'
import db, { CommentReactionSchema } from '@play-money/database'

export const CreateSchema = CommentReactionSchema.pick({
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
