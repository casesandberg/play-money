import { EllipsisIcon, InfoIcon } from 'lucide-react'
import React from 'react'
import { getLeaderboard } from '@play-money/api-helpers/client'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import type { LeaderboardUser } from '@play-money/finance/types'
import { Badge } from '@play-money/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { cn } from '@play-money/ui/utils'
import { UserLink } from '@play-money/users/components/UserLink'

function LeaderboardUserTable({
  users,
  activeUserRank,
}: {
  users: Array<LeaderboardUser>
  activeUserRank?: LeaderboardUser
}) {
  return (
    <ul className="divide-y divide-muted">
      {users.map((leaderboardUser, i) => {
        return (
          <li
            className={cn(
              'flex items-center gap-2 px-4 py-2 even:bg-gray-50',
              leaderboardUser.userId === activeUserRank?.userId && 'bg-primary/10 ring-2 ring-inset ring-primary'
            )}
            key={leaderboardUser.userId}
          >
            <Badge
              className={cn(
                'size-5 justify-center p-0',
                i === 0 && 'bg-[#FFD700]',
                i === 1 && 'bg-[#C0C0C0]',
                i === 2 && 'bg-[#CD7F32]'
              )}
              variant={i > 2 ? 'outline' : 'black'}
            >
              {i + 1}
            </Badge>
            <UserLink
              className="truncate text-sm"
              hideUsername
              user={{ ...leaderboardUser, id: leaderboardUser.userId }}
            />
            <span className="ml-auto font-mono text-sm text-muted-foreground">
              <CurrencyDisplay isShort value={leaderboardUser.total} />
            </span>
          </li>
        )
      })}

      {activeUserRank && activeUserRank.rank > 10 ? (
        <>
          <li className={cn('flex items-center gap-2 px-4 py-1 text-sm')}>
            <EllipsisIcon className="size-3 text-muted-foreground" />
          </li>
          <li className={cn('flex items-center gap-2 px-4 py-2', 'bg-primary/10 ring-2 ring-inset ring-primary')}>
            <Badge className={cn('size-5 justify-center p-0')} variant="outline">
              {activeUserRank.rank}
            </Badge>
            <UserLink
              className="truncate text-sm"
              hideUsername
              user={{ ...activeUserRank, id: activeUserRank.userId }}
            />
            <span className="ml-auto font-mono text-sm text-muted-foreground">
              <CurrencyDisplay isShort value={activeUserRank.total} />
            </span>
          </li>
        </>
      ) : null}
    </ul>
  )
}

export default async function AppQuestionsPage() {
  const leaderboard = await getLeaderboard()

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const date = new Date()
  const monthIndex = date.getMonth()
  const monthName = monthNames[monthIndex]

  return (
    <div className="mx-auto max-w-screen-lg flex-1 gap-8 md:flex-row">
      <h3 className="mb-8 text-center text-2xl font-semibold">{monthName} Leaderboard</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between rounded-t-lg border-b bg-muted px-4 py-2 pt-8">
            <h4 className="text-lg font-semibold">Top traders</h4>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Calculated as all realized gains from trading during the period plus the net present value of any
                positions held during the period.
              </TooltipContent>
            </Tooltip>
          </div>
          <LeaderboardUserTable activeUserRank={leaderboard.userRankings?.trader} users={leaderboard.topTraders} />
        </div>

        <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between rounded-t-lg border-b bg-muted px-4 py-2 pt-8">
            <h4 className="text-lg font-semibold">Top creators</h4>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Calculated as all unique trader fees obtained during the time period.
              </TooltipContent>
            </Tooltip>
          </div>
          <LeaderboardUserTable activeUserRank={leaderboard.userRankings?.creator} users={leaderboard.topCreators} />
        </div>

        <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between rounded-t-lg border-b bg-muted px-4 py-2 pt-8">
            <h4 className="text-lg font-semibold">Top promoters</h4>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Calculated as all volume bonuses obtained from all liquidity boosted markets during the time period.
              </TooltipContent>
            </Tooltip>
          </div>
          <LeaderboardUserTable activeUserRank={leaderboard.userRankings?.promoter} users={leaderboard.topPromoters} />
        </div>

        <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between rounded-t-lg border-b bg-muted px-4 py-2 pt-8">
            <h4 className="text-lg font-semibold">Top questers</h4>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Calculated as all quest-related bonuses collected in the time period.
              </TooltipContent>
            </Tooltip>
          </div>
          <LeaderboardUserTable activeUserRank={leaderboard.userRankings?.quester} users={leaderboard.topQuesters} />
        </div>
      </div>
    </div>
  )
}
