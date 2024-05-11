import { _UserModel } from '@play-money/database'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserByUsername } from '@play-money/users/lib/getUserByUsername'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// TODO: Next doesnt like us exporting this schema...
const schema = createSchema({
  GET: {
    request: {
      params: _UserModel.pick({ username: true }),
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const { username } = schema.GET.request.params.parse(params)

    const user = await getUserByUsername({ username })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
