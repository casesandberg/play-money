import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'
import Decimal from 'decimal.js'
import _ from 'lodash'
import { createComment } from '@play-money/comments/lib/createComment'
import db from '@play-money/database'
import { createHouseSingupBonusTransaction } from '@play-money/finance/lib/createHouseSingupBonusTransaction'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { marketBuy } from '@play-money/markets/lib/marketBuy'
import { resolveMarket } from '@play-money/markets/lib/resolveMarket'
import { mockUser } from './mocks'
import { OmittedUserFields } from './prisma'

async function main() {
  let user_ids = await Promise.all(
    _.times(5, async (i) => {
      const devOverride =
        i === 0 && process.env.DEV_DB_SEED_EMAIL
          ? {
              email: process.env.DEV_DB_SEED_EMAIL,
              username: 'dev',
              displayName: 'Dev User',
            }
          : {
              email: faker.internet.email(),
            }

      let { primaryAccountId, ...data } = mockUser(devOverride) as User & OmittedUserFields
      const user = await db.user.create({
        data: {
          ...data,
          primaryAccount: {
            create: {
              type: 'USER',
            },
          },
        },
      })

      await createHouseSingupBonusTransaction({
        userId: user.id,
      })

      return data.id
    })
  )

  for (let i = 0; i < 10; i++) {
    const market = await createMarket({
      question: `Will ${faker.lorem.sentence().toLowerCase().slice(0, -1)}?`,
      description: `<p>${faker.lorem.paragraph()}</p>`,
      closeDate: faker.date.future(),
      createdBy: faker.helpers.arrayElement(user_ids),
      tags: [faker.word.noun(), faker.word.noun(), faker.word.noun(), faker.word.noun(), faker.word.noun()],
    })

    for (let j = 0; j < 10; j++) {
      const userId = faker.helpers.arrayElement(user_ids)
      await marketBuy({
        marketId: market.id,
        optionId: market.options[faker.helpers.arrayElement([0, 1])].id,
        userId,
        amount: new Decimal(faker.string.numeric({ length: { min: 3, max: 3 } })),
      })

      await faker.helpers.maybe(
        async () => {
          return await createComment({
            content: `<p>${faker.lorem.paragraph()}</p>`,
            authorId: userId,
            parentId: null,
            entityType: 'MARKET',
            entityId: market.id,
          })
        },
        { probability: 0.5 }
      )
    }

    await createComment({
      content: `<p>${faker.lorem.paragraph()}</p>`,
      authorId: faker.helpers.arrayElement(user_ids),
      parentId: null,
      entityType: 'MARKET',
      entityId: market.id,
    })

    await faker.helpers.maybe(
      async () => {
        return await resolveMarket({
          resolverId: market.createdBy,
          marketId: market.id,
          optionId: market.options[faker.helpers.arrayElement([0, 1])].id,
          supportingLink: faker.internet.url(),
        })
      },
      { probability: 0.2 }
    )
  }
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
