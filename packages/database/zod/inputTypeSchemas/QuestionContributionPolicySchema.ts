import { z } from 'zod';

export const QuestionContributionPolicySchema = z.enum(['DISABLED','OWNERS_ONLY','FRIENDS_ONLY','PUBLIC']);

export type QuestionContributionPolicyType = `${z.infer<typeof QuestionContributionPolicySchema>}`

export default QuestionContributionPolicySchema;
