import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import db from '@play-money/database'

const _ = jest.requireActual('lodash')
global._ = _

jest.mock('@play-money/database', () => {
  const original = jest.requireActual('@play-money/database')

  return {
    __esModule: true,
    ...original,
    default: mockDeep<PrismaClient>(),
  }
})

beforeEach(() => {
  mockReset(dbMock)
})

export const dbMock = db as unknown as DeepMockProxy<PrismaClient>
