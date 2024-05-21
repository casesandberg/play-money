import { z } from 'zod'
import db, { CommentEntityType, _CommentModel, _CommentReactionModel, _UserModel } from '@play-money/database'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export const MarketCommentSchema = _CommentModel.extend({
  author: _UserModel,
  reactions: z.array(
    _CommentReactionModel.extend({
      user: _UserModel,
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
