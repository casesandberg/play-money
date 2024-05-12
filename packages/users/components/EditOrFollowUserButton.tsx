'use client'

import { MoreVertical } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '@play-money/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@play-money/ui/dropdown-menu'
import { useUser } from '../context/UserContext'

export function EditOrFollowUserButton({ userId }: { userId: string }) {
  const { user } = useUser()
  return userId === user?.id ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <MoreVertical className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/settings">Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button>Follow</Button>
  )
}
