import { z } from 'zod';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  twitterHandle: z.string().nullable(),
  discordHandle: z.string().nullable(),
  website: z.string().nullable(),
  bio: z.string().nullable(),
  timezone: z.string(),
  primaryAccountId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // omitted: email: z.string(),
  // omitted: emailVerified: z.coerce.date().nullable(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;
