'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { User } from '@play-money/database'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Card } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const MentionList = forwardRef<MentionListRef, { items: Array<User>; command: (props: { id: string }) => void }>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
      const item = props.items[index]

      props.command({ id: item.id })
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => {
      setSelectedIndex(0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <Card className="flex flex-col divide-y" style={{ width: '250px' }}>
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={cn(
                'flex w-full items-center gap-2 px-2 py-1 text-left text-sm',
                index === selectedIndex && 'bg-muted/50'
              )}
              key={item.id}
              onClick={() => {
                selectItem(index)
              }}
              type="button"
            >
              <UserAvatar size="sm" user={item} />
              <div className="min-w-0 flex-1 truncate text-muted-foreground">
                <span className="font-semibold text-foreground">{item.displayName}</span> @{item.username}
              </div>
            </button>
          ))
        ) : (
          <div className="w-full px-2 py-1 text-center text-sm">No result</div>
        )}
      </Card>
    )
  }
)

MentionList.displayName = 'MentionList'
