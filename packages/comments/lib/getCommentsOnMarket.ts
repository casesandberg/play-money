import db, { CommentEntityType, Comment, CommentReaction, User } from '@play-money/database'

export type MarketComment = Comment & {
  author: User
  reactions: Array<
    CommentReaction & {
      user: User
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

  return comments
}
