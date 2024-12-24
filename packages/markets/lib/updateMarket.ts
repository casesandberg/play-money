import db, { Market } from '@play-money/database'
import { slugifyTitle } from './helpers'

export async function updateMarket({
  id,
  question,
  description,
  closeDate,
  tags,
  createdBy,
}: {
  id: string
  question?: string
  description?: string
  closeDate?: Date
  tags?: Array<string>
  createdBy?: string
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

  if (tags) {
    updatedData.tags = tags.map((tag) => slugifyTitle(tag))
  }

  if (createdBy) {
    updatedData.createdBy = createdBy
  }

  const updatedMarket = await db.market.update({
    where: { id },
    data: { ...updatedData, updatedAt: new Date() },
  })

  return updatedMarket
}
