import { NextResponse } from 'next/server'
import { type SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { updateNotificationsRead } from '@play-money/notifications/lib/updateNotificationsRead'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<SchemaResponse<typeof schema.post.flatResponses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const { resourceId, resourceType } = schema.post.requestBody.parse(body)

    if (resourceType === 'MARKET') {
      await updateNotificationsRead({ userId: session.user.id, marketId: resourceId })
    } else if (resourceType === 'LIST') {
      await updateNotificationsRead({ userId: session.user.id, listId: resourceId })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
