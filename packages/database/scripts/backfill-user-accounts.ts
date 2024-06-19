import db from '../prisma'

async function main() {
  try {
    const users = await db.user.findMany({
      where: {
        accounts: {
          none: {},
        },
      },
    })

    console.log(`Found ${users.length} users without accounts.`)

    for await (const user of users) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            accounts: {
              create: {},
            },
          },
        })
        console.log(`Successfully created account for user with id: ${user.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to update user with id: ${user.id}. Error: ${error.message}`)
      }
    }
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while fetching users: ${error.message}`)
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
