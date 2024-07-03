import fs from 'fs'
import path from 'path'
import db from '../prisma'

const marketId = 'cly3hgdte002gcgohgrc27csr'

async function main() {
  try {
    const market = await db.market.findFirst({
      where: {
        id: marketId,
      },

      include: {
        options: true,
        transactions: {
          include: {
            transactionItems: true,
          },
        },
      },
    })

    if (!market) {
      console.error(`Market with id ${marketId} not found.`)
      return
    }

    console.log(`Found market ${market.id} users with ${market.transactions.length} transactions.`)

    const buildDir = path.resolve(__dirname, '../tmp')
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir)
    }

    const outputPath = path.resolve(__dirname, `../tmp/market-${marketId}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(market, null, 2))
    console.log(`Market data saved to ${outputPath}`)
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
