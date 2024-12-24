import db, { List } from '@play-money/database'

export async function updateList({
  id,
  title,
  description,
  marketIds,
  tags,
  ownerId,
}: {
  id: string
  title?: string
  description?: string
  marketIds?: string[]
  tags?: string[]
  ownerId?: string
}) {
  const updatedData: Partial<List> = {}

  if (title) {
    updatedData.title = title
  }

  if (description !== undefined) {
    updatedData.description = description
  }

  if (ownerId) {
    updatedData.ownerId = ownerId
  }

  if (tags) {
    updatedData.tags = tags
  }

  const updatedList = await db.list.update({
    where: { id },
    data: {
      ...updatedData,
      markets: marketIds
        ? {
            set: marketIds.map((marketId) => ({ id: marketId })),
          }
        : undefined,
    },
    include: {
      markets: true,
    },
  })

  return updatedList
}
