import db from '@play-money/database'

export async function checkUsername({ username }: { username: string }) {
  const user = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive',
      },
    },
  })

  return {
    available: !user,
    message: user ? 'Username is already taken' : undefined,
  }
}
