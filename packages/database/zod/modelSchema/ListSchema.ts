import { z } from 'zod';
import { QuestionContributionPolicySchema } from '../inputTypeSchemas/QuestionContributionPolicySchema'

/////////////////////////////////////////
// LIST SCHEMA
/////////////////////////////////////////

export const ListSchema = z.object({
  contributionPolicy: QuestionContributionPolicySchema,
  id: z.string().cuid(),
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  description: z.string().nullable(),
  ownerId: z.string(),
  contributionReview: z.boolean().nullable(),
  tags: z.string().array().max(5),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type List = z.infer<typeof ListSchema>

export default ListSchema;
