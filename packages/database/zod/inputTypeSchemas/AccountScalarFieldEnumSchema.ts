import { z } from 'zod';

export const AccountScalarFieldEnumSchema = z.enum(['id','type','internalType','userId','marketId','createdAt','updatedAt']);

export default AccountScalarFieldEnumSchema;
