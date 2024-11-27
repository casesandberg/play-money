import { NextResponse } from 'next/server'
import z from 'zod'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface EndpointDefinition {
  parameters?: z.ZodObject<any> | z.ZodOptional<z.ZodObject<any>>
  requestBody?: z.ZodObject<any>
  responses: {
    [statusCode: number]: z.ZodObject<any> | z.ZodObject<any>[]
  }
}

export type SchemaResponse<T> =
  T extends z.ZodObject<any>
    ? NextResponse<z.infer<T>>
    : T extends z.ZodObject<any>[]
      ? NextResponse<z.infer<T[number]>>
      : never

type ApiEndpoints = Partial<Record<HttpMethod, EndpointDefinition>>

type UnwrapArray<T> = T extends Array<infer U> ? U : T

type EndpointWithFlatResponses<T extends EndpointDefinition> = T & {
  flatResponses: UnwrapArray<
    T['responses'][keyof T['responses']] extends Array<infer V> ? V : [T['responses'][keyof T['responses']]]
  >
}

type ProcessedApiEndpoints<T extends ApiEndpoints> = {
  [Method in keyof T]: T[Method] extends EndpointDefinition ? EndpointWithFlatResponses<T[Method]> : never
}

function flattenResponses(responses: EndpointDefinition['responses']): z.ZodObject<any>[] {
  return Object.values(responses).flatMap((response) => (Array.isArray(response) ? response : [response]))
}

export function createSchema<T extends ApiEndpoints>(endpoints: T): ProcessedApiEndpoints<T> {
  const processedEndpoints = {} as ProcessedApiEndpoints<T>

  for (const method in endpoints) {
    if (endpoints.hasOwnProperty(method)) {
      const endpointSpec = endpoints[method] as EndpointDefinition
      processedEndpoints[method as keyof T] = {
        ...endpointSpec,
        flatResponses: flattenResponses(endpointSpec.responses),
      } as ProcessedApiEndpoints<T>[typeof method]
    }
  }

  return processedEndpoints
}
