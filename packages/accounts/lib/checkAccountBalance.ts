import Decimal from 'decimal.js'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { getAccountBalance } from './getAccountBalance'

export async function checkAccountBalance(
  accountId: string,
  currencyCode: CurrencyCodeType,
  amount: Decimal
): Promise<boolean> {
  const balance = await getAccountBalance({ accountId, currencyCode })

  return balance.gte(amount)
}
