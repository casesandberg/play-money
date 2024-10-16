import { z } from 'zod';

export const MarketScalarFieldEnumSchema = z.enum(['id','question','description','slug','closeDate','resolvedAt','canceledAt','canceledById','createdBy','tags','ammAccountId','clearingAccountId','createdAt','updatedAt','commentCount','uniqueTradersCount','uniquePromotersCount','liquidityCount','parentListId']);

export default MarketScalarFieldEnumSchema;
