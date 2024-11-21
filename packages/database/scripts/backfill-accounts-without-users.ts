import { updateMarket } from '@play-money/markets/lib/updateMarket'
import db from '../prisma'

async function main() {
  try {
    const accountsWithoutUsers = await db.account.findMany({
      where: {
        type: 'USER',
        userId: null,
      },
    })

    console.log(`Found ${accountsWithoutUsers.length} user accounts without users.`)

    for (const account of accountsWithoutUsers) {
      const user = await db.user.findFirst({
        where: {
          primaryAccountId: account.id,
        },
      })

      if (user) {
        await db.account.update({
          where: {
            id: account.id,
          },
          data: {
            userId: user.id,
          },
        })
        console.log(`Updated account ${account.id} with user ${user.id}`)
      } else {
        console.log(`No user found for account ${account.id}`)
      }
    }
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while fetching accounts: ${error.message}`)
  } finally {
    await db.$disconnect()
    console.log('Database connection closed.')
  }
}

main().catch((e) => {
  const error = e as Error
  console.error(`Unexpected error: ${error.message}`)
  process.exit(1)
})
