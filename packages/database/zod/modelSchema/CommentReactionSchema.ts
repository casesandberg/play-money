import { z } from 'zod';

/////////////////////////////////////////
// COMMENT REACTION SCHEMA
/////////////////////////////////////////

export const CommentReactionSchema = z.object({
  id: z.string().cuid(),
  emoji: z.string(),
  userId: z.string(),
  commentId: z.string(),
})

export type CommentReaction = z.infer<typeof CommentReactionSchema>

export default CommentReactionSchema;
