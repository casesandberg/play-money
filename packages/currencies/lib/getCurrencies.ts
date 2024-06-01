import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function getCurrencies() {
  const currencies = await db.currency.findMany()

  return currencies
}

export async function getCurrency(code: CurrencyCodeType) {
  const currency = await db.currency.findUnique({
    where: { code },
  })

  if (!currency) {
    throw new Error(`Currency with code ${code} not found`)
  }

  return currency
}
