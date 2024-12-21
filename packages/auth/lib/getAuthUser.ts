import { auth } from '@play-money/auth'
import db from '@play-money/database'

export async function getAuthUser(request: Request): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) {
    return session.user.id
  }

  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) {
    return null
  }

  const apiKeyRecord = await db.apiKey.findUnique({
    where: {
      key: apiKey,
      isRevoked: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      id: true,
      userId: true,
    },
  })

  if (!apiKeyRecord) {
    return null
  }

  // Update last used timestamp
  await db.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKeyRecord.userId
}
