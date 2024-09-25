import db, { Market } from '@play-money/database'
import { ExtendedMarket } from '../types'

export function getMarket(params: { id: string; extended: true }): Promise<ExtendedMarket>
export function getMarket(params: { id: string; extended?: false }): Promise<Market>
export function getMarket(params: { id: string; extended?: boolean }): Promise<Market | ExtendedMarket>

export async function getMarket({
  id,
  extended,
}: {
  id: string
  extended?: boolean
}): Promise<Market | ExtendedMarket> {
  if (extended) {
    return db.market.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        user: true,
        options: true,
        marketResolution: {
          include: {
            resolution: true,
            resolvedBy: true,
          },
        },
        parentList: true,
      },
    })
  }

  return db.market.findUniqueOrThrow({ where: { id } })
}
