import { generateReferralCode } from '@play-money/referrals/lib/helpers'
import db from '../prisma'

async function backfillReferralCodes() {
  const users = await db.user.findMany({
    where: { referralCode: null },
    select: { id: true },
  })

  for (const user of users) {
    let referralCode = ''
    let isUnique = false

    while (!isUnique) {
      referralCode = generateReferralCode()
      const existingUser = await db.user.findUnique({
        where: { referralCode },
      })
      isUnique = !existingUser
    }

    await db.user.update({
      where: { id: user.id },
      data: { referralCode },
    })
  }

  console.log(`Updated ${users.length} users with referral codes.`)
}

backfillReferralCodes()
  .catch(console.error)
  .finally(() => db.$disconnect())
