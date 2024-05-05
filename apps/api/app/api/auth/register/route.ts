import { _UserModel } from '@play-money/database'
import { UserExistsError } from '@play-money/auth/lib/exceptions'
import { registerUser } from '@play-money/auth/lib/registerUser'
import { formatZodError } from '@play-money/api-helpers/lib/formatZodError'
import { NextResponse } from 'next/server'
import * as z from 'zod'

export const dynamic = 'force-dynamic'

const RequestBody = _UserModel.pick({ email: true, password: true })
type RequestBody = z.infer<typeof RequestBody>

const ResponseBody = z.union([_UserModel.pick({ id: true, email: true }), z.object({ error: z.string() })])
type ResponseBody = z.infer<typeof ResponseBody>

export async function POST(req: Request): Promise<NextResponse<ResponseBody>> {
  try {
    const body = await req.json()
    const { email, password } = RequestBody.parse(body)

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
