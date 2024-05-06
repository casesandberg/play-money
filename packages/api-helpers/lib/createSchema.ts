import { _UserModel } from '@play-money/database'
import * as z from 'zod'

export const dynamic = 'force-dynamic'

type Keys = 'request' | 'response'
type Method = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'

type RequestIsh =
  | {
      body: z.ZodObject<{}>
    }
  | {
      params: z.ZodObject<{}>
    }
  | undefined

type Option<Req extends RequestIsh, Res, K extends Keys> = {
  [F in Keys]: F extends 'request'
    ? { [P in keyof Req]: Req[P] }
    : Record<number, Res | { content: Res; description: string }>
}

type Schema<Req extends RequestIsh, Res extends z.ZodObject<{}>, M extends Method, K extends Keys> = {
  [key in M]: {
    [F in Keys]: F extends 'request' ? { [P in keyof Req]: Req[P] } : z.infer<Res>
  }
}

// TODO: Use to extrapolate by creating a plugin similar to next-swagger-doc

export function createSchema<Req extends RequestIsh, Res extends z.ZodObject<{}>, K extends Keys, M extends Method>(
  options: Record<M, Option<Req, Res, K>>
): Schema<Req, Res, M, K> {
  const schema = <Schema<Req, Res, M, K>>{}

  const methods = Object.keys(options) as M[]
  for (const method of methods) {
    const option = options[method]
    if (option) {
      const responseSchemas = Object.values(option.response).map((schema) =>
        'content' in schema ? schema.content : schema
      )
      const responseUnion = z.union(responseSchemas as [Res, Res, ...Res[]])

      schema[method] = {
        request: option.request,
        response: responseUnion as z.infer<typeof responseUnion>,
      }
    }
  }

  return schema
}
