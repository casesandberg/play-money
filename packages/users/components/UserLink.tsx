import Link from 'next/link'
import React from 'react'
import { UserProfile } from '@play-money/users/lib/sanitizeUser'

export function UserLink({ user }: { user: UserProfile }) {
  return (
    <Link href={`/${user.username}`} className="space-x-1 hover:underline">
      <span className="font-medium">{user.displayName}</span>
      <span className="text-muted-foreground">@{user.username}</span>
    </Link>
  )
}
