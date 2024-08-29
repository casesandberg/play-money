import { z } from 'zod';

export const AssetTypeSchema = z.enum(['CURRENCY','MARKET_OPTION']);

export type AssetTypeType = `${z.infer<typeof AssetTypeSchema>}`

export default AssetTypeSchema;
