import db from '../prisma'

async function main() {
  try {
    // Find markets with exactly two options: "Yes" and "No"
    const markets = await db.market.findMany({
      where: {
        options: {
          every: {
            name: {
              in: ['Yes', 'No'],
            },
          },
        },
      },
      include: {
        options: true,
      },
    })

    // Filter markets where "Yes" and "No" options have the same createdAt time
    const marketsToUpdate = markets.filter((market) => {
      const yesOption = market.options.find((option) => option.name === 'Yes')
      const noOption = market.options.find((option) => option.name === 'No')
      return yesOption && noOption && yesOption.createdAt.getTime() === noOption.createdAt.getTime()
    })

    console.log(`Found ${marketsToUpdate.length} markets with "Yes" and "No" options having the same createdAt time.`)

    for (const market of marketsToUpdate) {
      const noOption = market.options.find((option) => option.name === 'No')
      if (noOption) {
        // Update the "No" option's createdAt to be 1ms later
        const updatedNoOption = await db.marketOption.update({
          where: { id: noOption.id },
          data: {
            createdAt: new Date(noOption.createdAt.getTime() + 1),
          },
        })

        console.log(`Updated "No" option for market ${market.id}. New createdAt: ${updatedNoOption.createdAt}`)
      }
    }

    console.log('Migration completed successfully.')
  } catch (error) {
    console.error(`An error occurred during migration: ${(error as Error).message}`)
  } finally {
    await db.$disconnect()
    console.log('Database connection closed.')
  }
}

main().catch((e) => {
  console.error(`Unexpected error: ${(e as Error).message}`)
  process.exit(1)
})
