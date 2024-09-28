// @ts-nocheck
import db from '../prisma'

const startBalanceIds = ['cm1hmp45500254quvzhzazvrf', 'cm1hmpbwu003c4quvvj5z4up5']
const endBalanceId = 'cm0apnra5006n65jijps76cg4'

async function main() {
  try {
    let numberSquashed = 0

    await db.$transaction(async (tx) => {
      const endBalance = await tx.balance.findUniqueOrThrow({
        where: {
          id: endBalanceId,
        },
      })

      for (const balanceId of startBalanceIds) {
        const balance = await tx.balance.findUnique({
          where: {
            id: balanceId,
          },
        })

        if (balance) {
          const newSubtotals = { ...endBalance.subtotals }
          for (const key in balance.subtotals) {
            if (endBalance.subtotals[key]) {
              newSubtotals[key] += balance.subtotals[key]
            } else {
              newSubtotals[key] = balance.subtotals[key]
            }
          }

          await tx.balance.update({
            where: {
              id: endBalanceId,
            },
            data: {
              total: {
                increment: balance.total,
              },
              subtotals: newSubtotals,
            },
          })

          await tx.balance.delete({
            where: {
              id: balanceId,
            },
          })

          numberSquashed++
        }
      }
    })

    console.log(`Squashed ${numberSquashed} balances into endBalanceId`)
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
