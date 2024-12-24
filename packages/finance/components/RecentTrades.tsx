'use client'

import _ from 'lodash'
import Link from 'next/link'
import { useRecentTrades } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { calculateBalanceChanges, findBalanceChange } from '@play-money/finance/lib/helpers'
import { formatDistanceToNowShort } from '@play-money/ui'
import { UserLink } from '@play-money/users/components/UserLink'

export function RecentTrades() {
  const { data: transactionsData } = useRecentTrades()
  const transactions = transactionsData?.data

  return (
    <ul className="divide-y divide-muted text-sm">
      {_.take(transactions, 5).map((transaction) => {
        if (!transaction.initiator) {
          return null
        }
        const balanceChanges = calculateBalanceChanges(transaction)
        const primaryChange = findBalanceChange({
          balanceChanges,
          accountId: transaction.initiator.primaryAccountId,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
        })
        const optionName = transaction.options[0]?.name

        return (
          <li className="py-2" key={transaction.id}>
            {transaction.initiator ? (
              <div className="inline-flex items-center gap-1 pr-1">
                <UserLink hideUsername user={transaction.initiator} />
              </div>
            ) : null}
            {transaction.type === 'TRADE_BUY' ? 'bought' : 'sold'}{' '}
            <span className="font-semibold">
              <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort />{' '}
              {_.truncate(optionName, { length: 40 })}
            </span>{' '}
            {transaction.market ? (
              <>
                in{' '}
                <span className="underline">
                  <Link
                    href={`/questions/${transaction.market.id}/${transaction.market.slug}`}
                    legacyBehavior
                    key={transaction.id}
                  >
                    {_.truncate(transaction.market.question, { length: 60 })}
                  </Link>
                </span>
              </>
            ) : null}{' '}
            <span className="text-muted-foreground">{formatDistanceToNowShort(transaction.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}
