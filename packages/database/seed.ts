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
      imageUrl: './images/dollars.svg',
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
      imageUrl: './images/yes-shares.svg',
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
      imageUrl: './images/no-shares.svg',
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
      imageUrl: './images/lp-bonuses.svg',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  })

  const houseUser = await db.user.upsert({
    where: { email: 'house@playmoney.com' },
    update: {},
    create: {
      email: 'house@playmoney.com',
      displayName: 'House',
      username: 'house',
    },
  })

  const exchangerUser = await db.user.upsert({
    where: { email: 'exchanger@playmoney.com' },
    update: {},
    create: {
      email: 'exchanger@playmoney.com',
      displayName: 'Exchanger',
      username: 'exchanger',
    },
  })

  let user_ids = await Promise.all(
    _.times(10, async () => {
      let data = mockUser()
      await db.user.create({ data })
      return data.id
    })
  )
  await Promise.all(
    _.times(5, async () => {
      const ammId = faker.string.uuid()
      let data = mockUser({
        username: `amm-${ammId}`,
        displayName: 'amm',
        email: `amm-${ammId}@playmoney.com`,
        isAMM: true,
      })
      const amm = await db.user.create({ data })

      await db.market.create({
        data: {
          ...mockMarket({
            createdBy: faker.helpers.arrayElement(user_ids),
          }),
          ammId: amm.id,
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
