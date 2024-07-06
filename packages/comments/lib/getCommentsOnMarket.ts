import db, { CommentEntityType, Comment, CommentReaction } from '@play-money/database'
import { UserProfile, sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export type MarketComment = Comment & {
  author: UserProfile
  reactions: Array<
    CommentReaction & {
      user: UserProfile
    }
  >
}

export async function getCommentsOnMarket({ marketId }: { marketId: string }): Promise<Array<MarketComment>> {
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
