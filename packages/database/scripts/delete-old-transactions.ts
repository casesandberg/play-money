// @ts-nocheck
import db from '../prisma'

// TODO: Cascade deletes, at least for transactions->transactionItems

async function main() {
  try {
    await db.$transaction([db.transactionItem.deleteMany({}), db.transaction.deleteMany({}), db.account.deleteMany({})])

    console.log(`Market ${marketId} deleted`)
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
