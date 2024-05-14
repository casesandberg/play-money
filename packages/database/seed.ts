import { faker } from '@faker-js/faker'
import _ from 'lodash'
import zod from 'zod'
import db from './prisma'
import { _UserModel } from './zod'

function fakerUser(): zod.infer<typeof _UserModel> {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName({ firstName, lastName }),
    displayName: faker.person.fullName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    avatarUrl: faker.helpers.maybe(faker.image.avatar),
    bio: faker.helpers.maybe(faker.person.bio),
    twitterHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }),
    discordHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }),
    website: faker.helpers.maybe(faker.internet.domainName, { probability: 0.3 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}

async function main() {
  await Promise.all(
    _.times(10, async () => {
      await prisma.user.create({ data: fakerUser() })
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
