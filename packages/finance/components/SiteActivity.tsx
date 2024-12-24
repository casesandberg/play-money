'use client'

import _ from 'lodash'
import { DiamondPlusIcon, CoinsIcon } from 'lucide-react'
import Link from 'next/link'
import { useSiteActivity } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { TransactionWithEntries } from '@play-money/finance/types'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { UserLink } from '@play-money/users/components/UserLink'
import { UsersCondensedList } from '@play-money/users/components/UsersCondensedList'
import { SiteActivityItem } from './SiteActivityItem'

function isNotNull<T>(value: T | null): value is T {
  return value !== null && value !== undefined
}

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

export function SiteActivity() {
  const { data } = useSiteActivity()
  const { data: activities = [] } = data || {}

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => {
        if (activity.type === 'TRADE_TRANSACTION' && activity.transactions?.length && activity.option) {
          const uniqueInitiators = _(activity.transactions)
            .map((t) => t.initiator)
            .uniqBy('id')
            .filter(isNotNull)
            .value()

          const transactionDescriptor: Array<string> = []
          if (activity.transactions.some((transaction) => transaction.type === 'TRADE_BUY')) {
            transactionDescriptor.push('bought')
          }
          if (activity.transactions.some((transaction) => transaction.type === 'TRADE_SELL')) {
            transactionDescriptor.push('sold')
          }
          return (
            <SiteActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<CoinsIcon className="size-4 text-muted-foreground" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UsersCondensedList users={uniqueInitiators} /> {transactionDescriptor.join(' & ')}{' '}
              <span className="font-medium text-foreground">
                <CurrencyDisplay value={summarizeTransactions(activity.transactions)} />{' '}
                {_.truncate(activity.option.name, { length: 40 })}
              </span>{' '}
              {activity.transactions[0].market ? (
                <>
                  in{' '}
                  <span className="underline">
                    <Link
                      href={`/questions/${activity.transactions[0].market.id}/${activity.transactions[0].market.slug}`}
                      legacyBehavior
                      key={activity.transactions[0].id}
                    >
                      {_.truncate(activity.transactions[0].market.question, { length: 50 })}
                    </Link>
                  </span>
                </>
              ) : null}
            </SiteActivityItem>
          )
        } else if (activity.type === 'LIQUIDITY_TRANSACTION' && activity.transactions?.length) {
          const uniqueInitiators = _(activity.transactions)
            .map((t) => t.initiator)
            .uniqBy('id')
            .filter(isNotNull)
            .value()

          return (
            <SiteActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<DiamondPlusIcon className="size-4 text-purple-600" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UsersCondensedList users={uniqueInitiators} /> added{' '}
              <CurrencyDisplay value={summarizeTransactions(activity.transactions)} /> liquidity{' '}
              {activity.transactions[0].market ? (
                <>
                  to{' '}
                  <span className="underline">
                    <Link
                      href={`/questions/${activity.transactions[0].market.id}/${activity.transactions[0].market.slug}`}
                      legacyBehavior
                      key={activity.transactions[0].id}
                    >
                      {_.truncate(activity.transactions[0].market.question, { length: 50 })}
                    </Link>
                  </span>
                </>
              ) : null}
            </SiteActivityItem>
          )
        } else if (activity.type === 'MARKET_CREATED' && activity.market) {
          return (
            <SiteActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<UserAvatar user={activity.market.user} size="sm" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UserLink user={activity.market.user} hideUsername className="text-foreground" /> created{' '}
              {activity.market ? (
                <>
                  <span className="underline">
                    <Link
                      href={`/questions/${activity.market.id}/${activity.market.slug}`}
                      legacyBehavior
                      key={activity.market.id}
                    >
                      {_.truncate(activity.market.question, { length: 50 })}
                    </Link>
                  </span>
                </>
              ) : null}
            </SiteActivityItem>
          )
        } else if (activity.type === 'MARKET_RESOLVED' && activity.marketResolution) {
          return (
            <SiteActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<UserAvatar user={activity.marketResolution.resolvedBy} size="sm" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UserLink user={activity.marketResolution.resolvedBy} hideUsername className="text-foreground" /> resolved{' '}
              {activity.marketResolution.market ? (
                <span className="underline">
                  <Link
                    href={`/questions/${activity.marketResolution.market.id}/${activity.marketResolution.market.slug}`}
                    legacyBehavior
                    key={activity.marketResolution.market.id}
                  >
                    {_.truncate(activity.marketResolution.market.question, { length: 50 })}
                  </Link>
                </span>
              ) : null}{' '}
              to <span className="text-foreground">{activity.marketResolution.resolution.name}</span>
            </SiteActivityItem>
          )
        } else if (activity.type === 'LIST_CREATED' && activity.list) {
          return (
            <SiteActivityItem
              key={activity.timestampAt.toString()}
              timestampAt={activity.timestampAt}
              icon={<UserAvatar user={activity.list.owner} size="sm" />}
              isFirst={i === 0}
              isLast={i === activities.length - 1}
            >
              <UserLink user={activity.list.owner} hideUsername className="text-foreground" /> created{' '}
              <span className="underline">
                <Link href={`/lists/${activity.list.id}/${activity.list.slug}`} legacyBehavior key={activity.list.id}>
                  {_.truncate(activity.list.title, { length: 50 })}
                </Link>
              </span>
            </SiteActivityItem>
          )
        }

        return activity.type
      })}
    </div>
  )
}
