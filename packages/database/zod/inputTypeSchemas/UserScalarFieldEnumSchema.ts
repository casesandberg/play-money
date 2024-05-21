import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','email','username','displayName','avatarUrl','twitterHandle','discordHandle','website','bio','emailVerified','createdAt','updatedAt']);

export default UserScalarFieldEnumSchema;
