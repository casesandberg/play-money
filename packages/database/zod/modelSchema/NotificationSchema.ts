import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { NotificationTypeSchema } from '../inputTypeSchemas/NotificationTypeSchema'

/////////////////////////////////////////
// NOTIFICATION SCHEMA
/////////////////////////////////////////

export const NotificationSchema = z.object({
  type: NotificationTypeSchema,
  id: z.string().cuid(),
  recipientId: z.string(),
  actorId: z.string(),
  content: JsonValueSchema.nullable(),
  marketId: z.string().nullable(),
  marketOptionId: z.string().nullable(),
  marketResolutionId: z.string().nullable(),
  transactionId: z.string().nullable(),
  listId: z.string().nullable(),
  commentId: z.string().nullable(),
  parentCommentId: z.string().nullable(),
  commentReactionId: z.string().nullable(),
  actionUrl: z.string(),
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Notification = z.infer<typeof NotificationSchema>

export default NotificationSchema;
