import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getNotifications } from '@play-money/notifications/lib/getNotifications'
import { getUnreadNotificationCount } from '@play-money/notifications/lib/getUnreadNotificationCount'
import { updateNotificationsRead } from '@play-money/notifications/lib/updateNotificationsRead'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [unreadCount, notifications] = await Promise.all([
      getUnreadNotificationCount({ userId: session.user.id }),
      getNotifications({ userId: session.user.id }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}

export async function POST(_req: Request): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await updateNotificationsRead({ userId: session.user.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
