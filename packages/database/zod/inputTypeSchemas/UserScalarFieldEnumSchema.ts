import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','username','displayName','avatarUrl','twitterHandle','discordHandle','website','bio','timezone','createdAt','updatedAt','email','emailVerified']);

export default UserScalarFieldEnumSchema;
