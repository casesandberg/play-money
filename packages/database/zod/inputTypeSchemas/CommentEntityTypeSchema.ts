import { z } from 'zod';

export const CommentEntityTypeSchema = z.enum(['MARKET','LIST']);

export type CommentEntityTypeType = `${z.infer<typeof CommentEntityTypeSchema>}`

export default CommentEntityTypeSchema;
