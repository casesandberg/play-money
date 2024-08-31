import Decimal from 'decimal.js'
import { createHouseUserGiftTransaction } from '@play-money/finance/lib/createHouseUserGiftTransaction'
import { getUserById } from '@play-money/users/lib/getUserById'
import db from '../prisma'

const userId = 'cm0ioq1nl0000v2k9p427yejq'
const amount = new Decimal(0)

async function main() {
  try {
    const user = await getUserById({ id: userId })

    if (user.primaryAccountId) {
      await createHouseUserGiftTransaction({ userId: user.id, amount, initiatorId: '' })

      console.log(`Gifted user ${userId} ${amount}`)
    }
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while sending user gift: ${error.message}`)
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
