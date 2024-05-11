import { _UserModel } from '@play-money/database'
import { UserExistsError } from '@play-money/auth/lib/exceptions'
import { registerUser } from '@play-money/auth/lib/registerUser'
import { ServerErrorSchema, createSchema, formatZodError } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'
import z from 'zod'

export const dynamic = 'force-dynamic'

// TODO: Next doesnt like us exporting this schema...
const schema = createSchema({
  POST: {
    request: {
      body: _UserModel.pick({ email: true, password: true }),
    },
    response: {
      201: _UserModel.pick({ id: true, email: true }),
      409: {
        content: ServerErrorSchema,
        description: 'User already exists with that email address',
      },
      422: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})

export async function POST(req: Request): Promise<NextResponse<typeof schema.POST.response>> {
  try {
    const body = await req.json()
    const { email, password } = schema.POST.request.body.parse(body)

    const user = await registerUser({ email, password })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (error) {
    if (error instanceof UserExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(error) }, { status: 422 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
