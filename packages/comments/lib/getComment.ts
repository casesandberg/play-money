import db, { Comment, CommentReaction, User } from '@play-money/database'
import { CommentNotFoundError } from './exceptions'

export type CommentWithReactions = Comment & {
  author: User
  reactions: Array<
    CommentReaction & {
      user: User
    }
  >
}

export async function getComment({ id }: { id: string }): Promise<CommentWithReactions> {
  const comment = await db.comment.findUnique({
    where: {
      id,
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

  if (!comment) {
    throw new CommentNotFoundError(`Comment with id "${id}" not found`)
  }

  return comment
}
