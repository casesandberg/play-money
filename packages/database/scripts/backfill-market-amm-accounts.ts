import db from '../prisma'

async function main() {
  try {
    const markets = await db.market.findMany({
      where: {
        accounts: {
          none: {},
        },
      },
    })

    console.log(`Found ${markets.length} markets without accounts.`)

    for await (const market of markets) {
      try {
        await db.market.update({
          where: { id: market.id },
          data: {
            ammAccount: {
              create: {
                type: 'MARKET_AMM' as const,
              },
            },
            clearingAccount: {
              create: {
                type: 'MARKET_CLEARING' as const,
              },
            },
          },
        })
        console.log(`Successfully created account for market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to update market with id: ${market.id}. Error: ${error.message}`)
      }
    }
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while fetching markets: ${error.message}`)
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
