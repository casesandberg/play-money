import z from 'zod'
import { fromError } from 'zod-validation-error'

export function formatZodError(error: z.ZodError): string {
  return fromError(error).toString()
}
