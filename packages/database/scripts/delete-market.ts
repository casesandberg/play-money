import db from '../prisma'

const marketId = 'clyb4y767001087vumwtp1t0o'

// TODO: Cascade deletes, at least for transactions->transactionItems, and market->marketOptions

async function main() {
  try {
    await db.$transaction([
      db.transactionEntry.deleteMany({
        where: {
          transaction: {
            marketId: marketId,
          },
        },
      }),
      db.transaction.deleteMany({
        where: {
          marketId: marketId,
        },
      }),
      db.marketOption.deleteMany({
        where: {
          marketId: marketId,
        },
      }),
      db.market.deleteMany({
        where: {
          id: marketId,
        },
      }),
    ])

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
