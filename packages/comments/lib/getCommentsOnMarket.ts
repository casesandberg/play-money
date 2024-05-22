import { z } from 'zod'
import db, { CommentEntityType, CommentSchema, CommentReactionSchema, UserSchema } from '@play-money/database'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export const MarketCommentSchema = CommentSchema.extend({
  author: UserSchema,
  reactions: z.array(
    CommentReactionSchema.extend({
      user: UserSchema,
    })
  ),
})

export async function getCommentsOnMarket({ marketId }: { marketId: string }) {
  const comments = await db.comment.findMany({
    where: {
      entityType: CommentEntityType.MARKET,
      entityId: marketId,
    },
    include: {
      author: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
  })

  return comments.map((comment) => ({
    ...comment,
    author: sanitizeUser(comment.author),
    reactions: comment.reactions.map((reaction) => ({
      ...reaction,
      user: sanitizeUser(reaction.user),
    })),
  }))
}
