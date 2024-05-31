import { z } from 'zod';

export const TransactionItemScalarFieldEnumSchema = z.enum(['id','userId','currencyId','transactionId','amount','createdAt']);

export default TransactionItemScalarFieldEnumSchema;
