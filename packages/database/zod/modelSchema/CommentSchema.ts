import { z } from 'zod';
import { CommentEntityTypeSchema } from '../inputTypeSchemas/CommentEntityTypeSchema'

/////////////////////////////////////////
// COMMENT SCHEMA
/////////////////////////////////////////

export const CommentSchema = z.object({
  entityType: CommentEntityTypeSchema,
  id: z.string().cuid(),
  content: z.string().min(1).max(5000),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  edited: z.boolean(),
  authorId: z.string(),
  parentId: z.string().nullable(),
  hidden: z.boolean(),
  entityId: z.string(),
  listId: z.string().nullable(),
})

export type Comment = z.infer<typeof CommentSchema>

export default CommentSchema;
