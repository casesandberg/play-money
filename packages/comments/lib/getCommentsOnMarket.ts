import db, { CommentEntityType, Comment, User, CommentReaction } from '@play-money/database'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export type MarketComment = Comment & {
  user: User
  reactions: Array<
    CommentReaction & {
      user: User
    }
  >
}

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
