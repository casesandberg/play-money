import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getUserById } from '@play-money/users/lib/getUserById'
import { updateUserById } from '@play-money/users/lib/updateUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById({ id: session.user.id })

    return NextResponse.json(user)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}

export async function PATCH(req: Request): Promise<SchemaResponse<typeof schema.patch.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const updateData = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const user = await updateUserById({ id: session.user.id, ...updateData })

    return NextResponse.json(user)
  } catch (error: unknown) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
