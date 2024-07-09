import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db, { MarketSchema, MarketOption, MarketOptionSchema } from '@play-money/database'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { slugifyTitle } from './helpers'

type PartialOptions = Pick<MarketOption, 'name' | 'currencyCode'>

export async function createMarket({
  question,
  description,
  closeDate,
  createdBy,
  options,
  subsidyAmount = new Decimal(1000),
}: {
  question: string
  description: string
  closeDate: Date | null
  createdBy: string
  options?: Array<PartialOptions>
  subsidyAmount?: Decimal
}) {
  let slug = slugifyTitle(question)
  const marketData = MarketSchema.omit({ id: true }).parse({
    question,
    description,
    closeDate,
    resolvedAt: null,
    slug,
    updatedAt: new Date(),
    createdAt: new Date(),
    createdBy,
  })

  let parsedOptions: Array<PartialOptions>

  if (options?.length) {
    parsedOptions = options.map((data) => MarketOptionSchema.pick({ name: true, currencyCode: true }).parse(data))
  } else {
    parsedOptions = [
      {
        name: 'Yes',
        currencyCode: 'YES',
      },
      {
        name: 'No',
        currencyCode: 'NO',
      },
    ]
  }

  const userAccount = await getUserAccount({ id: marketData.createdBy })
  const hasEnoughBalance = await checkAccountBalance({
    accountId: userAccount.id,
    currencyCode: 'PRIMARY',
    amount: subsidyAmount,
  })

  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to create market')
  }

  const createdMarket = await db.market.create({
    data: {
      ...marketData,
      options: {
        createMany: {
          data: parsedOptions.map((option) => ({
            name: option.name,
            currencyCode: option.currencyCode,
            updatedAt: new Date(),
            createdAt: new Date(),
          })),
        },
      },
      accounts: {
        create: {}, // Create AMM Account
      },
    },
    include: {
      options: true,
    },
  })

  await createMarketLiquidityTransaction({
    userId: marketData.createdBy,
    amount: subsidyAmount,
    marketId: createdMarket.id,
  })

  return createdMarket
}
