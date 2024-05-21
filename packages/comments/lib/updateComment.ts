import { z } from 'zod'
import db, { CommentSchema } from '@play-money/database'

export const UpdateSchema = CommentSchema.pick({ content: true }).partial()

export async function updateComment({ id, ...data }: { id: string } & z.infer<typeof UpdateSchema>) {
  // TODO: @casesandberg Figure out a cleaner way to strip undefined/nulls
  const { content } = UpdateSchema.transform((data) => {
    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value != null))
  }).parse(data)

  const updatedData: z.infer<typeof UpdateSchema> & { edited?: boolean } = {}

  if (content) {
    updatedData.content = content
    updatedData.edited = true
  }

  const updatedComment = await db.comment.update({
    where: { id },
    data: updatedData,
  })

  return updatedComment
}
