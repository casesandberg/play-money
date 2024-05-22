import { NextResponse } from 'next/server'
import zod from 'zod'
import { formatZodError } from '@play-money/api-helpers'
import { UserExistsError } from '@play-money/auth/lib/exceptions'
import { registerUser } from '@play-money/auth/lib/registerUser'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<NextResponse<typeof schema.POST.response>> {
  try {
    const body = (await req.json()) as unknown
    const { email } = schema.POST.request.body.parse(body)

    const user = await registerUser({ email, password: 'password' })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof UserExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error instanceof zod.ZodError) {
      return NextResponse.json({ error: formatZodError(error) }, { status: 422 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
