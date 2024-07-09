import db, { Market } from '@play-money/database'
import { slugifyTitle } from './helpers'

export async function updateMarket({
  id,
  question,
  description,
  closeDate,
}: {
  id: string
  question?: string
  description?: string
  closeDate?: Date
}) {
  const updatedData: Partial<Market> = {}

  if (question) {
    updatedData.question = question
    updatedData.slug = slugifyTitle(question)
  }

  if (description) {
    updatedData.description = description
  }

  if (closeDate) {
    updatedData.closeDate = closeDate
  }

  const updatedMarket = await db.market.update({
    where: { id },
    data: updatedData,
  })

  return updatedMarket
}
