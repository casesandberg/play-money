import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { getAccountBalance } from './getAccountBalance'

export async function checkAccountBalance(
  accountId: string,
  currencyCode: CurrencyCodeType,
  amount: number
): Promise<boolean> {
  const balance = await getAccountBalance(accountId, currencyCode)

  return balance >= amount
}
