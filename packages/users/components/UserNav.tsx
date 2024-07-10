'use client'

import { Laptop, Sun, Moon } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { useTheme } from '@play-money/ui/ThemeProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
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

export function UserNav() {
  const { user } = useUser()
  const { theme = 'system', setTheme } = useTheme()

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl ?? ''} alt={`@${user.username}`} />
            <AvatarFallback>{user.username.toUpperCase().slice(0, 2)}</AvatarFallback>
          </Avatar>
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
