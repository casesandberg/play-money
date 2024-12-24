import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { getUserById } from '@play-money/users/lib/getUserById'
import { updateUserById } from '@play-money/users/lib/updateUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById({ id: userId })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}

export async function PATCH(req: Request): Promise<SchemaResponse<typeof schema.patch.responses>> {
  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const updateData = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const user = await updateUserById({ id: userId, ...updateData })

    return NextResponse.json({ data: user })
  } catch (error: unknown) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
