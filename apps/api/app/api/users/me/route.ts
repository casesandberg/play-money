import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getUserById } from '@play-money/users/lib/getUserById'
import { updateUserById } from '@play-money/users/lib/updateUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
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

export async function PATCH(req: Request): Promise<SchemaResponse<typeof schema.PATCH.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const updateData = schema.PATCH.requestBody.parse(body)

    const user = await updateUserById({ id: session.user.id, ...updateData })

    return NextResponse.json(user)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
