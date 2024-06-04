import { z } from 'zod';

export const AuthAccountScalarFieldEnumSchema = z.enum(['userId','type','provider','providerAccountId','refresh_token','access_token','expires_at','token_type','scope','id_token','session_state','createdAt','updatedAt']);

export default AuthAccountScalarFieldEnumSchema;
