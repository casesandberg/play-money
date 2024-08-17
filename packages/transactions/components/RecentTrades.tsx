'use client'

import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import Link from 'next/link'
import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { UserLink } from '@play-money/users/components/UserLink'
import { TransactionWithItems } from '../lib/getTransactions'
import { summarizeTransaction } from '../lib/helpers'

export function RecentTrades() {
  const { data } = useSWR<{ transactions: Array<TransactionWithItems> }>(
    `/v1/transactions?transactionType=MARKET_BUY,MARKET_SELL`,
    { refreshInterval: 1000 * 60 * 5 }
  ) // 5 mins

  return (
    <ul className="divide-y divide-muted text-sm">
      {_.take(data?.transactions, 5).map((transaction) => {
        const summary = summarizeTransaction(transaction)
        const userSummary = summary[transaction.creatorId]

        return (
          <li className="py-2" key={transaction.id}>
            {transaction.creator.user ? (
              <div className="inline-flex items-center gap-1 pr-1">
                <UserLink hideUsername user={transaction.creator.user} />
              </div>
            ) : null}
            {transaction.type === 'MARKET_BUY' ? 'bought' : 'sold'}{' '}
            <span className="font-medium">
              <CurrencyDisplay value={userSummary.PRIMARY.abs().toNumber()} isShort />{' '}
              {!userSummary.YES.eq(0) ? 'Yes' : 'No'}
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
            <span className="text-muted-foreground">
              {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
