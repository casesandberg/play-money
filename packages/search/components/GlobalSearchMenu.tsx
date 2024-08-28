'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getSearch } from '@play-money/api-helpers/client'
import { Market, User } from '@play-money/database'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@play-money/ui/command'
import { DialogDescription, DialogTitle } from '@play-money/ui/dialog'

export function GlobalSearchMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ users: Array<User>; markets: Array<Market> } | null>(null)

  useEffect(() => {
    async function search() {
      if (open) {
        const data = await getSearch({ query })
        setResults(data)
      }
    }

    search()
  }, [query, open])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} commandProps={{ shouldFilter: false }}>
      <DialogTitle className="sr-only">Search</DialogTitle>
      <DialogDescription className="sr-only">Global search for users and markets</DialogDescription>
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
                <UserAvatar user={user} size="sm" />
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
