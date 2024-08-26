import { z } from 'zod';

export const TransactionEntryScalarFieldEnumSchema = z.enum(['id','amount','assetType','assetId','fromAccountId','toAccountId','transactionId','createdAt']);

export default TransactionEntryScalarFieldEnumSchema;
