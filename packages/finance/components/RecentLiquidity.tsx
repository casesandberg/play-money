'use client'

import _ from 'lodash'
import Link from 'next/link'
import React from 'react'
import { useLiquidity } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { formatDistanceToNowShort } from '@play-money/ui'
import { UserLink } from '@play-money/users/components/UserLink'
import { calculateBalanceChanges, findBalanceChange } from '../lib/helpers'

export function RecentLiquidity() {
  const { data } = useLiquidity()

  return (
    <ul className="divide-y divide-muted text-sm">
      {_.take(data?.transactions, 5).map((transaction) => {
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

        return (
          <li className="py-2" key={transaction.id}>
            <span className="font-medium">
              <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort />
            </span>
            <span className="text-muted-foreground"> added to </span>
            {transaction.market ? (
              <span className="underline">
                <Link
                  href={`/questions/${transaction.market.id}/${transaction.market.slug}`}
                  legacyBehavior
                  key={transaction.id}
                >
                  {_.truncate(transaction.market.question, { length: 60 })}
                </Link>
              </span>
            ) : null}
            <span className="text-muted-foreground"> by </span>
            {transaction.initiator ? (
              <div className="inline-flex items-center gap-1 pr-1">
                <UserLink hideUsername user={transaction.initiator} />
              </div>
            ) : null}
            <span className="text-muted-foreground">{formatDistanceToNowShort(transaction.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}
