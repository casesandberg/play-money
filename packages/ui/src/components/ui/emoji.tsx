'use client'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { init as initEmoji, SearchIndex } from 'emoji-mart'
import { Smile } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import type { ButtonProps } from './button'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

void initEmoji({ data })

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Emoji-mart custom element
  namespace React.JSX {
    interface IntrinsicElements {
      ['em-emoji']: { shortcodes: string; className?: string; size?: string; key?: string }
    }
  }
}

export function EmojiPicker({
  buttonProps,
  onSelect,
  onOpenChange,
}: {
  buttonProps: ButtonProps
  onSelect: (emoji: string) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setIsOpen(open)
        onOpenChange?.(open)
      }}
      open={isOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" {...buttonProps} className={cn('h-6', buttonProps.className)}>
          <Smile className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent variant="ghost">
        <Picker
          autoFocus // eslint-disable-line jsx-a11y/no-autofocus -- Inner prop to focus search on render. Ok since in a dropdown.
          onEmojiSelect={(emoji: { shortcodes: string }) => {
            onSelect(emoji.shortcodes)
            setIsOpen(false)
            onOpenChange?.(false)
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type EmojiReaction = {
  id: string
  emoji: string
  user: {
    id: string
    displayName: string
  }
}

// TODO: @casesandberg Cut off emoji list after certain amount

export function EmojiReactionList({
  reactions,
  activeUserId,
  pickerClassName,
  onSelect,
  onOpenChange,
}: {
  reactions: Array<EmojiReaction>
  activeUserId?: string
  pickerClassName?: string
  onSelect: (emoji: string) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [client, setClient] = useState(false)

  useEffect(function preventHydrationWarningsForSSR() {
    setClient(true)
  }, [])

  const groupedReactions: Record<
    string,
    { id: string; shortcodes: Array<string>; users: Array<EmojiReaction['user']> }
  > = {}

  reactions.forEach(({ emoji, user }) => {
    const [shortcode, id] = SearchIndex.SHORTCODES_REGEX.exec(emoji) || ['', '']

    if (!groupedReactions.hasOwnProperty(id)) {
      groupedReactions[id] = {
        id,
        shortcodes: [shortcode],
        users: [user],
      }
    } else {
      if (!groupedReactions[id].shortcodes.includes(shortcode)) {
        groupedReactions[id].shortcodes.push(shortcode)
      }
      if (!groupedReactions[id].users.find((u) => u.id === user.id)) {
        groupedReactions[id].users.push(user)
      }
    }
  })

  return (
    <div className={cn(reactions.length && 'min-h-6')}>
      {client && reactions.length ? (
        <div className="flex flex-row flex-wrap items-center gap-2">
          {Object.values(groupedReactions).map((reaction) => (
            <Tooltip key={reaction.id}>
              <TooltipTrigger asChild>
                <Button
                  className="h-6"
                  onClick={() => {
                    onSelect(reaction.shortcodes[0])
                  }}
                  size="icon"
                  variant={reaction.users.find((u) => u.id === activeUserId) ? 'default' : 'secondary'}
                >
                  {reaction.shortcodes.map((shortcode) => (
                    <em-emoji key={shortcode} shortcodes={shortcode} />
                  ))}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {reaction.users.map(({ displayName }) => displayName).join(', ')} reacted with :{reaction.id}:
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          <EmojiPicker
            buttonProps={{
              className: pickerClassName,
            }}
            onOpenChange={onOpenChange}
            onSelect={onSelect}
          />
        </div>
      ) : null}
    </div>
  )
}
