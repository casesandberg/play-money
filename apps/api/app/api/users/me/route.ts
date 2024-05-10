import { _UserModel } from '@play-money/database'
import { getUserById } from '@play-money/users/lib/getUserById'
import { updateUserById, UpdateSchema } from '@play-money/users/lib/updateUserById'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'

export const dynamic = 'force-dynamic'

export const schema = createSchema({
  GET: {
    // TODO: @casesandberg Fix typescript to allow for no request data
    request: {
      body: UpdateSchema,
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    request: {
      body: UpdateSchema,
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
    console.log(req.headers.get('cookie'))
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById({ id: session.user.id })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}

export async function PATCH(req: Request): Promise<NextResponse<typeof schema.PATCH.response>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await updateUserById({ id: session.user.id })

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}
