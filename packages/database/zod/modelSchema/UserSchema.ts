import { z } from 'zod';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().min(1, { message: "Email is required" }).email(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  twitterHandle: z.string().nullable(),
  discordHandle: z.string().nullable(),
  website: z.string().nullable(),
  bio: z.string().nullable(),
  emailVerified: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;
