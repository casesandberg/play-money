import { faker } from '@faker-js/faker'
import _ from 'lodash'
import db from '@play-money/database'
import { mockMarket, mockUser } from './mocks'

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
      await db.user.create({
        data: {
          ...data,
          accounts: {
            create: {},
          },
        },
      })
      return data.id
    })
  )
  await Promise.all(
    _.times(5, async () => {
      await db.market.create({
        data: {
          ...mockMarket({
            createdBy: faker.helpers.arrayElement(user_ids),
          }),
          accounts: {
            create: {},
          },
        },
      })
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
