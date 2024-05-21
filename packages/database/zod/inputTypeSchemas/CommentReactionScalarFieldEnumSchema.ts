import { z } from 'zod';

export const CommentReactionScalarFieldEnumSchema = z.enum(['id','emoji','userId','commentId']);

export default CommentReactionScalarFieldEnumSchema;
