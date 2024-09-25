import db, { List } from '@play-money/database'
import { ExtendedList } from '../types'

export function getList(params: { id: string; extended: true }): Promise<ExtendedList>
export function getList(params: { id: string; extended?: false }): Promise<List>
export function getList(params: { id: string; extended?: boolean }): Promise<List | ExtendedList>

export async function getList({ id, extended }: { id: string; extended?: boolean }): Promise<List | ExtendedList> {
  if (extended) {
    return db.list.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        owner: true,
        markets: {
          include: {
            market: {
              include: {
                user: true,
                options: true,
                marketResolution: {
                  include: {
                    resolution: true,
                    resolvedBy: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  return db.list.findUniqueOrThrow({ where: { id } })
}
