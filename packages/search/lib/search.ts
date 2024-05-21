import zod from 'zod'
import db from '@play-money/database'
import { UserSchema } from '@play-money/database'
import { UserProfile, sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export async function search({ query = '' }: { query?: string }): Promise<{ users: Array<UserProfile> }> {
  let users

  if (query && query.length > 3) {
    users = await db.$queryRaw<Array<zod.infer<typeof UserSchema>>>`
      SELECT *, 
        ts_rank_cd(to_tsvector('english', username || ' ' || "displayName"), plainto_tsquery('english', ${query})) AS rank
      FROM "User"
      WHERE to_tsvector('english', username || ' ' || "displayName") @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 5;
    `
  } else {
    users = await db.$queryRaw<Array<zod.infer<typeof UserSchema>>>`
      SELECT *
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `
  }

  return { users: users.map(sanitizeUser) }
}
