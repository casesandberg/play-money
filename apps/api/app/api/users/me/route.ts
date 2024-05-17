import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { _UserModel } from '@play-money/database'
import { getUserById } from '@play-money/users/lib/getUserById'
import { updateUserById } from '@play-money/users/lib/updateUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<NextResponse<typeof schema.GET.response>> {
  try {
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

    const body = (await req.json()) as unknown
    const updateData = schema.PATCH.request.body.parse(body)

    const user = await updateUserById({ id: session.user.id, ...updateData })

    return NextResponse.json(user)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
