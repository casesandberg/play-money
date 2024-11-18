import React from 'react'
import { User } from '@play-money/database'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { UserLink } from './UserLink'

export function UsersCondensedList({ users }: { users: Array<User> }) {
  if (!users.length) {
    return null
  }

  if (users.length === 1) {
    return <UserLink user={users[0]} hideUsername className="text-foreground" />
  }

  if (users.length === 2) {
    return (
      <>
        <UserLink user={users[0]} hideUsername className="text-foreground" /> &{' '}
        <UserLink user={users[1]} hideUsername className="text-foreground" />
      </>
    )
  }

  return (
    <>
      <UserLink user={users[0]} hideUsername className="text-foreground" /> &{' '}
      <Tooltip>
        <TooltipTrigger>
          <span className="font-medium text-foreground hover:underline">{users.length - 1} others</span>
        </TooltipTrigger>
        <TooltipContent>
          {users.slice(1).map((user, i) => (
            <>
              {i !== 0 ? ', ' : ''}
              <UserLink user={user} hideUsername />
            </>
          ))}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
