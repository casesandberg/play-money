import { z } from 'zod';

export const NotificationScalarFieldEnumSchema = z.enum(['id','recipientId','actorId','type','content','marketId','marketOptionId','marketResolutionId','transactionId','commentId','parentCommentId','commentReactionId','actionUrl','readAt','createdAt','updatedAt']);

export default NotificationScalarFieldEnumSchema;
