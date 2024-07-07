'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Market } from '@play-money/database'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@play-money/ui/command'
import { UserProfile } from '@play-money/users/lib/sanitizeUser'

export function GlobalSearchMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ users: Array<UserProfile>; markets: Array<Market> } | null>(null)

  useEffect(() => {
    async function search() {
      if (open) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/search?query=${query}`)

        if (!response.ok) {
          const { message } = await response.json()
          throw new Error(message || 'Network response was not ok')
        }
        setResults(await response.json())
      }
    }

    search()
  }, [query, open])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} commandProps={{ shouldFilter: false }}>
      <CommandInput
        placeholder="Search..."
        value={query}
        onInput={(event) => {
          setQuery(event.currentTarget.value)
        }}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results?.markets.length ? (
          <CommandGroup heading="Questions">
            {results.markets.map((market) => (
              <CommandItem
                key={market.id}
                value={market.id}
                className="flex flex-row gap-2"
                onSelect={() => {
                  router.push(`/questions/${market.id}/${market.slug}`)
                  onOpenChange(false)
                }}
              >
                <div className="line-clamp-2 font-semibold">{market.question}</div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {results?.users.length ? (
          <CommandGroup heading="Users">
            {results.users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.id}
                className="flex flex-row gap-2"
                onSelect={() => {
                  router.push(`/${user.username}`)
                  onOpenChange(false)
                }}
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={user.avatarUrl ?? ''} alt={`@${user.username}`} />
                  <AvatarFallback>{user.username.toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">{user.displayName}</div>
                <div className="text-muted-foreground">@{user.username}</div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}
