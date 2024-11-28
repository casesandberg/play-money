import { z } from 'zod';

/////////////////////////////////////////
// API KEY SCHEMA
/////////////////////////////////////////

export const ApiKeySchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1, { message: "Name is required" }),
  key: z.string(),
  userId: z.string(),
  lastUsedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  isRevoked: z.boolean(),
})

export type ApiKey = z.infer<typeof ApiKeySchema>

export default ApiKeySchema;
