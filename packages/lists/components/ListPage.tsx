'use client'

import _ from 'lodash'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { mutate } from 'swr'
import { LIST_BALANCE_PATH, MY_BALANCE_PATH } from '@play-money/api-helpers/client/hooks'
import { useSidebar } from '@play-money/markets/components/SidebarContext'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Badge } from '@play-money/ui/badge'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@play-money/ui/dropdown-menu'
import { ReadMoreEditor } from '@play-money/ui/editor'
import { UserLink } from '@play-money/users/components/UserLink'
import { useUser } from '@play-money/users/context/UserContext'
import { useSelectedItems } from '../../ui/src/contexts/SelectedItemContext'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'
import { canAddToList, canModifyList } from '../rules'
import { ExtendedList } from '../types'
import { AddMoreListDialog } from './AddMoreListDialog'
import { EditListDialog } from './EditListDialog'
import { ListGraph } from './ListGraph'
import { ListMarketRow } from './ListMarketRow'
import { ListToolbar } from './ListToolbar'

export function ListPage({
  list,
  renderComments,
  onRevalidate,
}: {
  list: ExtendedList
  renderComments: React.ReactNode
  onRevalidate: () => Promise<void>
}) {
  const { user } = useUser()
  const { triggerEffect } = useSidebar()
  const { selected, setSelected } = useSelectedItems()
  const [isAddMore, setIsAddMore] = useSearchParam('addMore')
  const [isEditing, setIsEditing] = useSearchParam('edit')

  const handleRevalidateBalance = async () => {
    void onRevalidate?.()
    void mutate(MY_BALANCE_PATH)
    void mutate(LIST_BALANCE_PATH(list.id))
  }

  return (
    <Card className="flex-1">
      <ListToolbar
        list={list}
        canEdit={user ? canModifyList({ list, user }) : false}
        onInitiateEdit={() => setIsEditing('true')}
      />

      <CardHeader className="pt-0 md:pt-0">
        <CardTitle className="leading-relaxed">{list.title}</CardTitle>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:flex-nowrap">
          {/* {!market.marketResolution ? (
            <div style={{ color: mostLikelyOption.color }} className="flex-shrink-0 font-medium">
              {Math.round(mostLikelyOption.probability || 0)}% {_.truncate(mostLikelyOption.name, { length: 30 })}
            </div>
          ) : null} */}
          {/* {market.closeDate ? (
            <div className="flex-shrink-0">
              {isPast(market.closeDate) ? 'Ended' : 'Ending'} {format(market.closeDate, 'MMM d, yyyy')}
            </div>
          ) : null} */}
          {list.owner ? (
            <div className="flex items-center gap-1 truncate">
              <UserAvatar user={list.owner} size="sm" />
              <UserLink user={list.owner} hideUsername />
            </div>
          ) : null}
          {/* <div>15 Traders</div>
          <div>$650 Volume</div> */}
        </div>
      </CardHeader>

      <CardContent>
        <ListGraph list={list} activeOptionId={selected[0]} />
      </CardContent>

      <CardContent>
        {list.markets.length ? (
          <Card className="divide-y">
            {list.markets.map((market, i) => (
              <ListMarketRow
                key={market.market.id}
                market={market.market}
                active={market.market.id === selected[0]}
                renderMenuItems={
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href={`/questions/${market.market.id}/${market.market.slug}`}>View market</Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                }
                onSelect={() => {
                  setSelected([market.market.id])
                  triggerEffect()
                }}
                onRevalidate={handleRevalidateBalance}
              />
            ))}
          </Card>
        ) : null}

        {canAddToList({ list, userId: user?.id }) ? (
          <div className="flex justify-end">
            <Button variant="ghost" className="text-muted-foreground" size="sm" onClick={() => setIsAddMore('true')}>
              <PlusIcon className="h-4 w-4" /> Add more
            </Button>
          </div>
        ) : null}
      </CardContent>

      <CardContent>
        <ReadMoreEditor value={list.description ?? ''} maxLines={6} />

        {list.markets.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {_(list.markets)
              .flatMap((market) => market.market.tags)
              .countBy()
              .toPairs()
              .sortBy(1)
              .reverse()
              .take(5)
              .map(([tag, count]) => (
                <Link href={`/questions/tagged/${tag}`} key={tag}>
                  <Badge variant="secondary">{tag}</Badge>
                </Link>
              ))
              .value()}
          </div>
        ) : null}
      </CardContent>

      <div className="px-6 text-lg font-semibold">Comments</div>
      {renderComments}

      <EditListDialog
        key={list.updatedAt.toString()} // reset form when list updates
        list={list}
        open={isEditing === 'true'}
        onClose={() => setIsEditing(undefined)}
        onSuccess={onRevalidate}
      />

      <AddMoreListDialog
        list={list}
        open={isAddMore != null}
        onClose={() => setIsAddMore(undefined)}
        onSuccess={onRevalidate}
      />
    </Card>
  )
}
