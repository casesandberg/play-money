import _ from 'lodash'
import { DiamondPlusIcon, CoinsIcon } from 'lucide-react'
import { revalidateTag } from 'next/cache'
import { getMarketActivity } from '@play-money/api-helpers/client'
import { CommentItemCard } from '@play-money/comments/components/CommentItemCard'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { TransactionWithEntries } from '@play-money/finance/types'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { UserLink } from '@play-money/users/components/UserLink'
import { UsersCondensedList } from '@play-money/users/components/UsersCondensedList'
import { MarketActivityItem } from './MarketActivityItem'

function summarizeTransactions(transactions: Array<TransactionWithEntries>) {
  const highestTotal =
    _(transactions)
      .flatMap('entries')
      .filter((entry) => entry.assetType === 'CURRENCY' && entry.assetId === 'PRIMARY')
      .groupBy('toAccountId')
      .map((entries) => _.sumBy(entries, (e) => Number(e.amount)))
      .max() || 0
  return highestTotal
}

export async function MarketActivity({ marketId }: { marketId: string }) {
  const { activities } = await getMarketActivity({ marketId })

  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`${marketId}:activity`)
  }

  return (
    <div className="space-y-4 p-4">
      {activities.map((activity, i) => {
        if (activity.type === 'COMMENT' && activity.comment) {
          return (
            <CommentItemCard
              key={activity.timestampAt.toString()}
              comment={activity.comment}
              entity={{ type: 'market', id: marketId }}
              onRevalidate={handleRevalidate}
            />
          )
        } else if (activity.type === 'TRADE_TRANSACTION' && activity.transactions?.length && activity.option) {
          const uniqueInitiators = _(activity.transactions)
            .map((t) => t.initiator)
            .uniqBy('id')
            .filter((initiator) => initiator !== null && initiator !== undefined)
            .value()

          const transactionDescriptor: Array<string> = []
          if (activity.transactions.some((transaction) => transaction.type === 'TRADE_BUY')) {
            transactionDescriptor.push('bought')
          }
          if (activity.transactions.some((transaction) => transaction.type === 'TRADE_SELL')) {
            transactionDescriptor.push('sold')
          }
          return (
            <MarketActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<CoinsIcon className="size-4 text-muted-foreground" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UsersCondensedList users={uniqueInitiators} /> {transactionDescriptor.join(' & ')}{' '}
              <span className="font-medium text-foreground">
                <CurrencyDisplay value={summarizeTransactions(activity.transactions)} /> {activity.option.name}
              </span>
            </MarketActivityItem>
          )
        } else if (activity.type === 'LIQUIDITY_TRANSACTION' && activity.transactions?.length) {
          const uniqueInitiators = _(activity.transactions)
            .map((t) => t.initiator)
            .uniqBy('id')
            .filter((initiator) => initiator !== null && initiator !== undefined)
            .value()

          return (
            <MarketActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<DiamondPlusIcon className="size-4 text-purple-600" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UsersCondensedList users={uniqueInitiators} /> added{' '}
              <CurrencyDisplay value={summarizeTransactions(activity.transactions)} /> liquidity
            </MarketActivityItem>
          )
        } else if (activity.type === 'MARKET_CREATED' && activity.market) {
          return (
            <MarketActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<UserAvatar user={activity.market.user} size="sm" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UserLink user={activity.market.user} hideUsername className="text-foreground" /> created the question
            </MarketActivityItem>
          )
        } else if (activity.type === 'MARKET_RESOLVED' && activity.marketResolution) {
          return (
            <MarketActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<UserAvatar user={activity.marketResolution.resolvedBy} size="sm" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UserLink user={activity.marketResolution.resolvedBy} hideUsername className="text-foreground" /> resolved
              question to <span className="text-foreground">{activity.marketResolution.resolution.name}</span>
            </MarketActivityItem>
          )
        }

        return activity.type
      })}
    </div>
  )
}
