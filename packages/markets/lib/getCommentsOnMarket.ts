import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import db, { CommentEntityType } from '@play-money/database'

export async function getCommentsOnMarket({ marketId }: { marketId: string }): Promise<Array<CommentWithReactions>> {
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
