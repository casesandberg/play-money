import { z } from 'zod';

export const ApiKeyScalarFieldEnumSchema = z.enum(['id','name','key','userId','lastUsedAt','createdAt','updatedAt','expiresAt','isRevoked']);

export default ApiKeyScalarFieldEnumSchema;
