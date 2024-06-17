'use server'

import { glob } from 'glob'
import path from 'node:path'
import type { z } from 'zod'

// Zod helpers copied from https://github.com/asteasolutions/zod-to-openapi/blob/cf6e694b526c0faf3f368372f55321426094fa26/src/lib/zod-is-type.ts
/* eslint-disable @typescript-eslint/no-explicit-any -- So many any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- So much access */

type ZodTypes = {
  ZodAny: z.ZodAny
  ZodArray: z.ZodArray<any>
  ZodBigInt: z.ZodBigInt
  ZodBoolean: z.ZodBoolean
  ZodBranded: z.ZodBranded<any, any>
  ZodDefault: z.ZodDefault<any>
  ZodEffects: z.ZodEffects<any>
  ZodEnum: z.ZodEnum<any>
  ZodIntersection: z.ZodIntersection<any, any>
  ZodLiteral: z.ZodLiteral<any>
  ZodNativeEnum: z.ZodNativeEnum<any>
  ZodNever: z.ZodNever
  ZodNull: z.ZodNull
  ZodNullable: z.ZodNullable<any>
  ZodNumber: z.ZodNumber
  ZodObject: z.AnyZodObject
  ZodOptional: z.ZodOptional<any>
  ZodPipeline: z.ZodPipeline<any, any>
  ZodReadonly: z.ZodReadonly<any>
  ZodRecord: z.ZodRecord
  ZodSchema: z.ZodSchema
  ZodString: z.ZodString
  ZodTuple: z.ZodTuple
  ZodType: z.ZodType
  ZodTypeAny: z.ZodTypeAny
  ZodUnion: z.ZodUnion<any>
  ZodDiscriminatedUnion: z.ZodDiscriminatedUnion<any, any>
  ZodUnknown: z.ZodUnknown
  ZodVoid: z.ZodVoid
  ZodDate: z.ZodDate
}

function isZodType<TypeName extends keyof ZodTypes>(schema: object, typeName: TypeName): schema is ZodTypes[TypeName] {
  return (schema as { _def?: { typeName: string } })._def?.typeName === typeName
}

function extractObjectShape(schema: z.ZodObject<any>): object {
  if (!schema.shape) {
    return
  }

  const shape: Record<string, any> = {}
  for (const [key, subSchema] of Object.entries(schema.shape)) {
    shape[key] = subSchema._def?.typeName
  }
  return shape
}

export const getApiDocs = async () => {
  const apiFolder = 'app/api'
  const globPattern = '**/schema.ts'
  const schemaFiles = glob.sync(path.join(apiFolder, globPattern))

  const paths: Record<
    string,
    Record<
      string,
      {
        requestBody?: {
          content: {
            'application/json': object
          }
        }
        parameters?: Array<{
          name: string
          in: 'query'
          schema: {
            type: string
          }
        }>
        responses?: Record<
          string,
          {
            description: string
            content: {
              'application/json': object
            }
          }
        >
      }
    >
  > = {}

  await Promise.all(
    schemaFiles.map(async (file: string) => {
      const endpoint = path.relative(apiFolder, path.dirname(file))
      const schema = (await import(`../app/api/${endpoint}/schema.ts`)).default as Record<
        string,
        {
          requestBody?: object
          parameters?: object
          responses?: object
          _originalResponses?: object
        }
      >
      const pathname = `/${endpoint}`

      if (!(pathname in paths)) {
        paths[pathname] = {}
      }

      for (const method in schema) {
        paths[pathname][method] = {}

        if (schema[method].requestBody) {
          paths[pathname][method].requestBody = {
            content: {
              'application/json': extractObjectShape(schema[method].requestBody),
            },
          }
        }

        const params = schema[method].parameters
        if (params) {
          paths[pathname][method].parameters = []

          if (isZodType(params, 'ZodObject')) {
            for (const [key, sch] of Object.entries(params.shape)) {
              if (isZodType(sch, 'ZodString')) {
                paths[pathname][method].parameters.push({
                  name: key,
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                })
              }
            }
          }
        }

        if (schema[method].responses) {
          paths[pathname][method].responses = {}

          for (const status in schema[method]._originalResponses) {
            const responseSchema = schema[method]._originalResponses[status]

            paths[pathname][method].responses[status] = {
              description: '',
              content: {
                'application/json': extractObjectShape(responseSchema),
              },
            }
          }
        }
      }
    })
  )

  return {
    openapi: '3.1.0',
    info: {
      title: 'Plat Money API',
      version: '1.0',
    },
    paths,
  }
}
