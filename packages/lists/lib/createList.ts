import Decimal from 'decimal.js'
import db from '@play-money/database'
import { QuestionContributionPolicyType } from '@play-money/database/zod/inputTypeSchemas/QuestionContributionPolicySchema'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { slugifyTitle } from '@play-money/markets/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { calculateTotalCost } from './helpers'

export async function createList({
  title,
  description,
  tags,
  ownerId,
  closeDate,
  markets,
  contributionPolicy,
}: {
  title: string
  description?: string
  tags?: Array<string>
  ownerId: string
  closeDate: Date | null
  markets: Array<{ name: string; color?: string }>
  contributionPolicy: QuestionContributionPolicyType
}) {
  const slug = slugifyTitle(title)
  const totalCost = calculateTotalCost(markets.length)
  const costPerMarket = new Decimal(totalCost).div(markets.length)

  const userAccount = await getUserPrimaryAccount({ userId: ownerId })
  const userPrimaryBalance = await getBalance({
    accountId: userAccount.id,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!userPrimaryBalance.total.gte(totalCost)) {
    throw new Error('User does not have enough balance to create list')
  }

  const createdMarkets = await Promise.all(
    markets.map((market) =>
      createMarket({
        question: market.name,
        description: description ?? '',
        options: [
          {
            name: 'Yes',
            color: market.color ?? '#3B82F6',
          },
          {
            name: 'No',
            color: '#EC4899',
          },
        ],
        closeDate,
        createdBy: ownerId,
        subsidyAmount: costPerMarket,
      })
    )
  )

  const createdList = await db.$transaction(
    async (tx) => {
      const list = await tx.list.create({
        data: {
          title,
          description,
          ownerId,
          slug,
          tags: tags?.map((tag) => slugifyTitle(tag)),
          markets: {
            createMany: {
              data: createdMarkets.map((market) => ({
                marketId: market.id,
              })),
            },
          },
          contributionPolicy,
        },
        include: {
          markets: true,
        },
      })

      await Promise.all(
        createdMarkets.map((market) => {
          return tx.market.update({
            where: {
              id: market.id,
            },
            data: {
              parentListId: list.id,
            },
          })
        })
      )

      return list
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  )

  return createdList
}
