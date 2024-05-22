import { z } from 'zod';

export const CommentEntityTypeSchema = z.enum(['MARKET']);

export type CommentEntityTypeType = `${z.infer<typeof CommentEntityTypeSchema>}`

export default CommentEntityTypeSchema;
