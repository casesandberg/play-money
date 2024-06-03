import { z } from 'zod';

export const AccountScalarFieldEnumSchema = z.enum(['id','internalType','userId','marketId','createdAt','updatedAt']);

export default AccountScalarFieldEnumSchema;
