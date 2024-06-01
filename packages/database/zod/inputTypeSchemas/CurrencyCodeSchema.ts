import { z } from 'zod';

export const CurrencyCodeSchema = z.enum(['PRIMARY','YES','NO','LPB']);

export type CurrencyCodeType = `${z.infer<typeof CurrencyCodeSchema>}`

export default CurrencyCodeSchema;
