import { z } from 'zod'

export function stripUndefined<T extends Record<string, any>>(
  obj: T
): { [K in keyof T]: Exclude<T[K], null | undefined> } {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as {
    [K in keyof T]: Exclude<T[K], null | undefined>
  }
}

export const zodCoerceCSVToArray = z.preprocess(
  (val) => (typeof val === 'string' ? val.split(',') : val),
  z.array(z.string())
)
