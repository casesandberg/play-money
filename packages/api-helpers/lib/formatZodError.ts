import { fromError } from 'zod-validation-error'
import z from 'zod'

export function formatZodError(error: z.ZodError): string {
  return fromError(error).toString()
}
