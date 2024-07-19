import { z } from 'zod';

export const NotificationGroupScalarFieldEnumSchema = z.enum(['id','recipientId','type','count','lastNotificationId','groupWindowEnd','groupKey','createdAt','updatedAt']);

export default NotificationGroupScalarFieldEnumSchema;
