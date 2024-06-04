import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { buy, costToHitProbability } from './maniswap-v1'

expect.extend({ toBeDeepCloseTo, toMatchCloseTo })

jest.mock('@play-money/accounts/lib/getAccountBalance', () => ({
  getAccountBalance: jest.fn(),
}))

describe('maniswap-v1', () => {
  describe('buy', () => {
    it('should return correct transactions for buying YES', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const transactions = await buy({
        fromAccountId: 'user1',
        ammAccountId: 'amm1',
        currencyCode: 'YES',
        amount: 50,
      })

      expect(transactions).toMatchCloseTo(
        [
          { accountId: 'user1', currencyCode: 'YES', amount: -50 },
          { accountId: 'user1', currencyCode: 'NO', amount: -50 },
          { accountId: 'amm1', currencyCode: 'YES', amount: 50 },
          { accountId: 'amm1', currencyCode: 'NO', amount: 50 },
          { accountId: 'amm1', currencyCode: 'YES', amount: -64.29 },
          { accountId: 'user1', currencyCode: 'YES', amount: 64.29 },
        ],
        2
      )
    })

    it('should return correct transactions for buying NO', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const transactions = await buy({
        fromAccountId: 'user1',
        ammAccountId: 'amm1',
        currencyCode: 'NO',
        amount: 50,
      })

      expect(transactions).toEqual([
        { accountId: 'user1', currencyCode: 'NO', amount: -50 },
        { accountId: 'user1', currencyCode: 'YES', amount: -50 },
        { accountId: 'amm1', currencyCode: 'NO', amount: 50 },
        { accountId: 'amm1', currencyCode: 'YES', amount: 50 },
        { accountId: 'amm1', currencyCode: 'NO', amount: -150 },
        { accountId: 'user1', currencyCode: 'NO', amount: 150 },
      ])
    })
  })

  describe('costToHitProbability', () => {
    it('should return zero cost and returnedShares for same probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: 0.75,
        maxAmount: 100,
      })

      expect(result).toEqual({
        cost: 0,
        returnedShares: 0,
      })
    })

    it('should return correct cost and returnedShares for increasing probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: 0.8,
        maxAmount: 100,
      })

      expect(result).toMatchCloseTo(
        {
          cost: 46.41,
          returnedShares: 59.81,
        },
        2
      )
    })

    it('should return correct cost and returnedShares for increasing probability to max', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: 0.99,
        maxAmount: 100,
      })

      expect(result).toMatchCloseTo(
        {
          cost: 100,
          returnedShares: 125,
        },
        2
      )
    })

    it('should return correct cost and returnedShares for decreasing probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: 0.5,
        maxAmount: 100,
      })

      expect(result).toMatchCloseTo(
        {
          cost: 73.21,
          returnedShares: 200,
        },
        2
      )
    })

    it('should return correct cost and returnedShares for decreasing probability to max', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return 100
        if (currencyCode === 'NO') return 300
        return 0
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: 0.25,
        maxAmount: 100,
      })

      expect(result).toEqual({
        cost: 100,
        returnedShares: 250,
      })
    })
  })
})
