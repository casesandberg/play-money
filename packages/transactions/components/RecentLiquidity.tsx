'use client'

import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { formatNumber } from '@play-money/currencies/lib/formatCurrency'
import { UserLink } from '@play-money/users/components/UserLink'
import { TransactionWithItems } from '../lib/getTransactions'
import { summarizeTransaction } from '../lib/helpers'

export function RecentLiquidity() {
  const { data } = useSWR<{ transactions: Array<TransactionWithItems> }>(`/v1/liquidity`, {
    refreshInterval: 1000 * 60 * 5,
  }) // 5 mins

  return (
    <ul className="divide-y divide-muted text-sm">
      {_.take(data?.transactions, 5).map((transaction) => {
        const summary = summarizeTransaction(transaction)
        const userSummary = summary[transaction.creatorId]

        return (
          <li className="py-2" key={transaction.id}>
            <span className="font-medium">
              <CurrencyDisplay value={userSummary.PRIMARY.abs().toNumber()} currencyCode="PRIMARY" isShort />
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
            {transaction.creator.user ? (
              <div className="inline-flex items-center gap-1 pr-1">
                <UserLink hideUsername user={transaction.creator.user} />
              </div>
            ) : null}
            <span className="text-muted-foreground">
              {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
