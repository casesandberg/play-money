'use client'

import { Laptop, Sun, Moon } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { ActiveUserBalance } from '@play-money/accounts/components/ActiveUserBalance'
import { useTheme } from '@play-money/ui/ThemeProvider'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Button } from '@play-money/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@play-money/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { useUser } from '@play-money/users/context/UserContext'

export function UserNav({ initialBalance }: { initialBalance: number }) {
  const { user } = useUser()
  const { theme = 'system', setTheme } = useTheme()

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-2">
          <UserAvatar user={user} />
          <ActiveUserBalance initialBalance={initialBalance} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            {/* <p className="text-xs leading-none text-muted-foreground">{user.email}</p> */}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${user.username}`}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex justify-between">
            Theme
            <Tabs defaultValue={theme} onValueChange={setTheme}>
              <TabsList className="h-auto p-px">
                <TabsTrigger value="system">
                  <Laptop className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="light">
                  <Sun className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="dark">
                  <Moon className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={() => signIn()}>Sign in</Button>
  )
}
