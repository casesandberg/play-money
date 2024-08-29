import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

const LeaderboardUserSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().or(z.null()).optional(),
  total: z.number(),
  rank: z.number(),
})

export default createSchema({
  GET: {
    responses: {
      200: z.object({
        topTraders: z.array(LeaderboardUserSchema),
        topCreators: z.array(LeaderboardUserSchema),
        topPromoters: z.array(LeaderboardUserSchema),
        topQuesters: z.array(LeaderboardUserSchema),
        userRankings: z
          .object({
            trader: LeaderboardUserSchema,
            creator: LeaderboardUserSchema,
            promoter: LeaderboardUserSchema,
            quester: LeaderboardUserSchema,
          })
          .or(z.null())
          .optional(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
