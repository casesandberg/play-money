import { z } from 'zod';

export const CommentScalarFieldEnumSchema = z.enum(['id','content','createdAt','updatedAt','edited','authorId','parentId','hidden','entityType','entityId']);

export default CommentScalarFieldEnumSchema;
