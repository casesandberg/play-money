'use client'

import { BellIcon } from 'lucide-react'
import useSWR from 'swr'
import { Badge } from '@play-money/ui/badge'
import { Button } from '@play-money/ui/button'
import { Card, CardContent } from '@play-money/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@play-money/ui/dropdown-menu'
import { useUser } from '@play-money/users/context/UserContext'
import { NotificationGroupWithLastNotification } from '../lib/getNotifications'
import { NotificationItem } from './NotificationItem'

export function NotificationDropdown() {
  const { user } = useUser()
  const { data } = useSWR<{ unreadCount: number; notifications: Array<NotificationGroupWithLastNotification> }>(
    user ? '/v1/users/me/notifications' : null,
    { refreshInterval: 1000 * 60 * 5 } // 5 mins
  )

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {data?.unreadCount && data?.unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"></span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[400px] p-0" align="end">
        <Card className="border-0 shadow-lg">
          <div className="flex justify-between border-b p-3 px-4 md:p-3 md:px-4">
            <div>
              Notifications
              <Badge variant="outline" className="ml-2">
                {data?.unreadCount}
              </Badge>
            </div>
            <div>
              <Button variant="link" size="sm" className="h-6 p-1" disabled={!data?.unreadCount}>
                Mark all read
              </Button>
            </div>
          </div>
          <CardContent className="max-h-[450px] overflow-y-auto p-0 md:p-0">
            <div className="divide-y">
              {data?.notifications.length ? (
                data?.notifications.map(({ id, count, lastNotification }, i) => (
                  <DropdownMenuItem key={id} asChild className="p-0">
                    <NotificationItem notification={lastNotification} count={count} unread={!lastNotification.readAt} />
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">Zero notifications</div>
              )}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null
}
