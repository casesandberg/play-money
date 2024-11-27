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

type InferZodResponse<T> =
  T extends z.ZodObject<any> ? z.infer<T> : T extends z.ZodObject<any>[] ? z.infer<T[number]> : never

type InferResponses<T extends { [key: number]: z.ZodObject<any> | z.ZodObject<any>[] }> = InferZodResponse<T[keyof T]>

export type SchemaResponse<T extends { [key: number]: z.ZodObject<any> | z.ZodObject<any>[] }> = Promise<
  NextResponse<InferResponses<T>>
>

export type ApiEndpoints = Partial<Record<HttpMethod, EndpointDefinition>>

export function createSchema<T extends ApiEndpoints>(endpoints: T): T {
  return endpoints
}
