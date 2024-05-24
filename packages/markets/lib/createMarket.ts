import { z } from 'zod'
import db, { MarketSchema } from '@play-money/database'

export async function createMarket(question: string, description: string, closeDate: Date, createdBy: string) {
  let slug = slugify(question)
  const marketData = MarketSchema.omit({id: true}).parse({
    question,
    description,
    closeDate,
    resolvedAt: null,
    slug,
    updatedAt: new Date(),
    createdAt: new Date(),
    createdBy,
  })
  const createdMarket = await db.market.create({
    data: marketData,
  })

  return createdMarket
}

function slugify(title: string, maxLen = 50) {
  // Based on django's slugify:
  // https://github.com/django/django/blob/a21a63cc288ba51bcf8c227a49de6f5bb9a72cc3/django/utils/text.py#L362
  let slug = title
    .normalize('NFKD') // Normalize to decomposed form (eg. é -> e)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/[\s]/g, '-') // Replace whitespace with a dash
    .replace(/-+/, '-') // Replace multiple dashes with a single dash

  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(/-+[^-]*?$/, '') // Remove the last word, since it might be cut off
  }

  return slug
}