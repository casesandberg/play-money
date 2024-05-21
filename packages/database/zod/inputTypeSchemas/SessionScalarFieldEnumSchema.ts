import { z } from 'zod';

export const SessionScalarFieldEnumSchema = z.enum(['sessionToken','userId','expires','createdAt','updatedAt']);

export default SessionScalarFieldEnumSchema;
