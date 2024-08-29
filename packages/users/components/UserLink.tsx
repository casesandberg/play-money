import Link from 'next/link'
import React from 'react'
import { User } from '@play-money/database'
import { cn } from '@play-money/ui/utils'

export function UserLink({
  user,
  hideUsername = false,
  className,
}: {
  user: Pick<User, 'username' | 'displayName' | 'id'>
  hideUsername?: boolean
  className?: string
}) {
  return (
    <Link href={`/${user.username}`} className={cn('space-x-1 hover:underline', className)}>
      <span className="font-medium">{user.displayName}</span>
      {!hideUsername && <span className="text-muted-foreground">@{user.username}</span>}
    </Link>
  )
}
