import db, { Market, User } from '@play-money/database'

interface SearchResults {
  users: Array<User>
  markets: Array<Market>
}

export async function search({ query = '' }: { query?: string }): Promise<SearchResults> {
  let users: Array<User> = []
  let markets: Array<Market> = []

  if (query && query.length > 3) {
    users = await db.$queryRaw<Array<User>>`
      SELECT *, 
        ts_rank_cd(to_tsvector('english', username || ' ' || "displayName"), plainto_tsquery('english', ${query})) AS rank
      FROM "User"
      WHERE to_tsvector('english', username || ' ' || "displayName") @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 5;
    `

    markets = await db.$queryRaw<Array<Market>>`
      SELECT *, 
        ts_rank_cd(to_tsvector('english', question || ' ' || description), plainto_tsquery('english', ${query})) AS rank
      FROM "Market"
      WHERE to_tsvector('english', question || ' ' || description) @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 5;
      `
  } else {
    users = await db.$queryRaw<Array<User>>`
      SELECT *
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `

    markets = await db.$queryRaw<Array<Market>>`
      SELECT *
      FROM "Market"
      ORDER BY "createdAt" DESC
      LIMIT 5;
      `
  }

  return {
    users,
    markets,
  }
}
