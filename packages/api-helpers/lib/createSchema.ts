import { NextResponse } from 'next/server'
import z from 'zod'

export type SchemaResponse<Res extends z.ZodObject<any>> = NextResponse<z.infer<Res>>

type SwaggerPathSpec = {
  [key: string]: {
    parameters?: z.ZodObject<any>
    requestBody?: z.ZodObject<any>
    responses: {
      [key: number]: z.ZodObject<any> | Array<z.ZodObject<any>>
    }
  }
}

type Flatten<T> = T extends Array<infer U> ? (U extends Array<any> ? Flatten<U> : U) : T

type TransformResType<Spec> = {
  [Method in keyof Spec]: Spec[Method] extends {
    responses: infer Res extends { [key: number]: z.ZodObject<any> | Array<z.ZodObject<any>> }
  }
    ? { [Key in Exclude<keyof Spec[Method], 'responses'>]: Spec[Method][Key] } & {
        responses: Flatten<Res[keyof Res] extends Array<infer V> ? V : [Res[keyof Res]]>
      }
    : Spec[Method]
}

function flattenToArray<Res extends { [key: number]: z.ZodObject<any> | Array<z.ZodObject<any>> }>(res: Res) {
  return Object.values(res).flatMap((response) => (Array.isArray(response) ? response : [response]))
}

export function createSchema<Spec extends SwaggerPathSpec>(spec: Spec): TransformResType<Spec> {
  const result: any = {}

  for (const method in spec) {
    if (spec.hasOwnProperty(method)) {
      const { responses, ...rest } = spec[method]
      result[method] = {
        ...rest,
        responses: flattenToArray(responses),
      }
    }
  }

  return result
}
