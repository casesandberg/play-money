import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { ListSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get a list',
    parameters: ListSchema.pick({ id: true }).extend({ extended: z.boolean().optional() }),
    responses: {
      200: z.object({ data: ListSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    summary: 'Update a list',
    security: true,
    parameters: ListSchema.pick({ id: true }),
    requestBody: ListSchema.pick({
      title: true,
      description: true,
      tags: true,
      ownerId: true,
    }).partial(),
    responses: {
      200: z.object({ data: ListSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
