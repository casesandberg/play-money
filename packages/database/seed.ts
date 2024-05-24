import { faker } from '@faker-js/faker'
import _ from 'lodash'
import zod from 'zod'
import db from './prisma'
import { UserSchema, MarketSchema } from './zod'

function fakerUser(): zod.infer<typeof UserSchema> {
function fakerUser(): zod.infer<typeof UserSchema> {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName({ firstName, lastName }),
    displayName: faker.person.fullName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    avatarUrl: faker.helpers.maybe(faker.image.avatar) ?? null,
    bio: faker.helpers.maybe(faker.person.bio) ?? null,
    twitterHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    discordHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    website: faker.helpers.maybe(faker.internet.domainName, { probability: 0.3 }) ?? null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}

function fakerMarket(userIds: string[]): zod.infer<typeof MarketSchema> {
  const question = faker.lorem.sentence()
  const description = faker.lorem.paragraph()
  const closeDate = faker.date.future()
  return {
    id: faker.string.uuid(),
    question,
    description,
    slug: faker.helpers.slugify(question),
    closeDate,
    resolvedAt: faker.helpers.maybe(faker.date.past, { probability: 0.3 }) ?? null,
    createdBy: faker.helpers.arrayElement(userIds),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}

async function main() {
  let user_ids = await Promise.all(
    _.times(10, async () => {
      let data = fakerUser()
      await prisma.user.create({ data })
      return data.id
    })
  )
  await Promise.all(
    _.times(5, async () => {
      await prisma.market.create({ data: fakerMarket(user_ids) })
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
