import { z } from 'zod';

export const VerificationTokenScalarFieldEnumSchema = z.enum(['identifier','token','expires']);

export default VerificationTokenScalarFieldEnumSchema;
