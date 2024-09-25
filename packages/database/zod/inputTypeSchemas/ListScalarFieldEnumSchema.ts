import { z } from 'zod';

export const ListScalarFieldEnumSchema = z.enum(['id','title','slug','description','ownerId','contributionPolicy','contributionReview','tags','createdAt','updatedAt']);

export default ListScalarFieldEnumSchema;
