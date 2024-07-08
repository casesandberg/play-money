import Decimal from 'decimal.js'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'
import { getAccountBalance } from './getAccountBalance'

export async function checkAccountBalance({
  accountId,
  currencyCode,
  amount,
  inflightTransactionItems = [],
}: {
  accountId: string
  currencyCode: CurrencyCodeType
  amount: Decimal
  inflightTransactionItems?: Array<TransactionItemInput>
}): Promise<boolean> {
  const balance = await getAccountBalance({ accountId, currencyCode })

  // Sum inflight transactions that havent landed yet if this check is part of the in progress transaction
  const inflightSum = inflightTransactionItems
    .filter((item) => item.accountId === accountId && item.currencyCode === currencyCode)
    .reduce((sum, item) => sum.plus(item.amount), new Decimal(0))

  // TODO: Implement decimal rounding backend-wide
  return balance.plus(inflightSum).toDecimalPlaces(4).gte(amount.toDecimalPlaces(4))
}
