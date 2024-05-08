import { _UserModel } from '@play-money/database'
import { getUserById } from '@play-money/users/lib/getUserById'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'

export const dynamic = 'force-dynamic'

export const schema = createSchema({
  GET: {
    // TODO: Fix typescript to allow for no request data
    request: {
      params: _UserModel.pick({ id: true }),
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})

export async function GET(req: Request): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById({ id: session.user.id })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
