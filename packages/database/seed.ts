import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'
import _ from 'lodash'
import { createComment } from '@play-money/comments/lib/createComment'
import db from '@play-money/database'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { marketBuy } from '@play-money/markets/lib/marketBuy'
import { resolveMarket } from '@play-money/markets/lib/resolveMarket'
import { createHouseUserGiftTransaction } from '@play-money/transactions/lib/createHouseUserGiftTransaction'
import { mockUser } from './mocks'

async function main() {
  await db.currency.upsert({
    where: { code: 'PRIMARY' },
    update: {},
    create: {
      name: 'Dollars',
      symbol: '$',
      code: 'PRIMARY',
      imageUrl: '/images/dollars.svg',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  })

  await db.currency.upsert({
    where: { code: 'YES' },
    update: {},
    create: {
      name: 'Yes Shares',
      symbol: 'Y',
      code: 'YES',
      imageUrl: '/images/yes-shares.svg',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  })

  await db.currency.upsert({
    where: { code: 'NO' },
    update: {},
    create: {
      name: 'No Shares',
      symbol: 'N',
      code: 'NO',
      imageUrl: '/images/no-shares.svg',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  })

  await db.currency.upsert({
    where: { code: 'LPB' },
    update: {},
    create: {
      name: 'LP Bonuses',
      symbol: 'LPB',
      code: 'LPB',
      imageUrl: '/images/lp-bonuses.svg',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  })

  await db.account.upsert({
    where: { internalType: 'HOUSE' },
    update: {},
    create: {
      internalType: 'HOUSE',
    },
  })

  await db.account.upsert({
    where: { internalType: 'EXCHANGER' },
    update: {},
    create: {
      internalType: 'EXCHANGER',
    },
  })

  let user_ids = await Promise.all(
    _.times(10, async () => {
      let data = mockUser()
      const user = await db.user.create({
        data: {
          ...data,
          accounts: {
            create: {},
          },
        },
      })

      await createHouseUserGiftTransaction({
        userId: user.id,
        creatorId: user.id,
        amount: new Decimal(50000),
      })

      return data.id
    })
  )
  await Promise.all(
    _.times(10, async () => {
      const market = await createMarket({
        question: faker.lorem.sentence(),
        description: `<p>${faker.lorem.paragraph()}</p>`,
        closeDate: faker.date.future(),
        createdBy: faker.helpers.arrayElement(user_ids),
      })

      await Promise.all(
        _.times(5, async () => {
          const creatorId = faker.helpers.arrayElement(user_ids)
          await marketBuy({
            marketId: market.id,
            optionId: market.options[faker.helpers.arrayElement([0, 1])].id,
            creatorId,
            amount: new Decimal(faker.string.numeric({ length: { min: 3, max: 3 } })),
          })

          await faker.helpers.maybe(
            async () => {
              return await createComment({
                content: `<p>${faker.lorem.paragraph()}</p>`,
                authorId: creatorId,
                parentId: null,
                entityType: 'MARKET',
                entityId: market.id,
              })
            },
            { probability: 0.5 }
          )
        })
      )

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

      return market
    })
  )
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
