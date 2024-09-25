import db, { List } from '@play-money/database'

export async function updateList({
  id,
  title,
  description,
  marketIds,
}: {
  id: string
  title?: string
  description?: string
  marketIds?: string[]
}) {
  const updatedData: Partial<List> = {}

  if (title) {
    updatedData.title = title
  }

  if (description !== undefined) {
    updatedData.description = description
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
