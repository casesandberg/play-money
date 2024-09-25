import db from '../prisma'

const marketIds = ['cm1hmxk3p004188ywvsgv9hff']

// TODO: Cascade deletes, at least for transactions->transactionItems, and market->marketOptions

async function main() {
  try {
    await db.$transaction([
      db.transactionEntry.deleteMany({
        where: {
          transaction: {
            marketId: {
              in: marketIds,
            },
          },
        },
      }),
      db.transaction.deleteMany({
        where: {
          marketId: {
            in: marketIds,
          },
        },
      }),
      db.marketOption.deleteMany({
        where: {
          marketId: {
            in: marketIds,
          },
        },
      }),
      db.market.deleteMany({
        where: {
          id: {
            in: marketIds,
          },
        },
      }),
    ])

    console.log(`${marketIds.length} Markets deleted`)
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
