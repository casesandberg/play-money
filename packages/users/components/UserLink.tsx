import Link from 'next/link'
import React from 'react'
import { cn } from '@play-money/ui/utils'
import { UserProfile } from '@play-money/users/lib/sanitizeUser'

export function UserLink({
  user,
  hideUsername = false,
  className,
}: {
  user: UserProfile
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
