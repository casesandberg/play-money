import db from '@play-money/database'

export async function getCurrencies() {
  const currencies = await db.currency.findMany()

  return currencies
}
