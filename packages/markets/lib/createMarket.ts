import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db, { MarketSchema, MarketOption, MarketOptionSchema } from '@play-money/database'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'

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
  let slug = slugify(question)
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

function slugify(title: string, maxLen = 50) {
  // Based on django's slugify:
  // https://github.com/django/django/blob/a21a63cc288ba51bcf8c227a49de6f5bb9a72cc3/django/utils/text.py#L362
  let slug = title
    .normalize('NFKD') // Normalize to decomposed form (eg. é -> e)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/[\s]/g, '-') // Replace whitespace with a dash
    .replace(/-+/, '-') // Replace multiple dashes with a single dash

  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(/-+[^-]*?$/, '') // Remove the last word, since it might be cut off
  }

  return slug
}
