import { NextResponse } from 'next/server'
import z from 'zod'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface EndpointDefinition {
  parameters?: z.ZodObject<any> | z.ZodOptional<z.ZodObject<any>>
  requestBody?: z.ZodObject<any>
  responses: {
    [statusCode: number]: z.ZodObject<any> | z.ZodObject<any>[] | z.ZodVoid
  }
  security?: boolean
  summary?: string
  private?: boolean // Internal or half-baked endpoints
}

type InferZodResponse<T> =
  T extends z.ZodObject<any>
    ? z.infer<T>
    : T extends z.ZodObject<any>[]
      ? z.infer<T[number]>
      : T extends z.ZodVoid
        ? void
        : never

type InferResponses<T extends { [key: number]: z.ZodObject<any> | z.ZodObject<any>[] | z.ZodVoid }> = InferZodResponse<
  T[keyof T]
>

export type SchemaResponse<T extends { [key: number]: z.ZodObject<any> | z.ZodObject<any>[] | z.ZodVoid }> = Promise<
  NextResponse<InferResponses<T>>
>

export type ApiEndpoints = Partial<Record<HttpMethod, EndpointDefinition>>
