import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

const LeaderboardUserSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().or(z.null()).optional(),
  total: z.number(),
  rank: z.number(),
})

export default {
  get: {
    parameters: z
      .object({
        year: z.coerce.number().optional(),
        month: z.coerce.number().optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        topTraders: z.array(LeaderboardUserSchema),
        topCreators: z.array(LeaderboardUserSchema),
        topPromoters: z.array(LeaderboardUserSchema),
        topQuesters: z.array(LeaderboardUserSchema),
        topReferrers: z.array(LeaderboardUserSchema),
        userRankings: z
          .object({
            trader: LeaderboardUserSchema.optional(),
            creator: LeaderboardUserSchema.optional(),
            promoter: LeaderboardUserSchema.optional(),
            quester: LeaderboardUserSchema.optional(),
            referrer: LeaderboardUserSchema.optional(),
          })
          .or(z.null())
          .optional(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
