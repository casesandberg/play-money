import { z } from 'zod';
import { NotificationTypeSchema } from '../inputTypeSchemas/NotificationTypeSchema'

/////////////////////////////////////////
// NOTIFICATION GROUP SCHEMA
/////////////////////////////////////////

export const NotificationGroupSchema = z.object({
  type: NotificationTypeSchema,
  id: z.string().cuid(),
  recipientId: z.string(),
  count: z.number().int(),
  lastNotificationId: z.string(),
  groupWindowEnd: z.coerce.date(),
  groupKey: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type NotificationGroup = z.infer<typeof NotificationGroupSchema>

export default NotificationGroupSchema;
