import Decimal from 'decimal.js'
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to'
import '@play-money/config/jest/jest-setup'
import { mockMarketOption } from '@play-money/database/mocks'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { getAccountBalance, addLiquidity, buy, costToHitProbability, sell } from './maniswap-v1'

expect.extend({ toBeDeepCloseTo, toMatchCloseTo })

jest.mock('./maniswap-v1', () => ({ ...jest.requireActual('./maniswap-v1'), getAccountBalance: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarketOption', () => ({ getMarketOption: jest.fn() }))

describe('maniswap-v1', () => {
  it('deprecated', async () => {
    expect(true).toBe(true)
  })
  // describe('buy', () => {
  //   it('should return correct transactions for buying YES', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))
  //     const transactions = await buy({
  //       fromAccountId: 'user1',
  //       ammAccountId: 'amm1',
  //       assetType: 'MARKET_OPTION',
  //       assetId: 'option-1',
  //       amount: new Decimal(50),
  //     })
  //     expect(transactions).toEqual([
  //       { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-50) },
  //       { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-50) },
  //       { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(50) },
  //       { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(50) },
  //       { accountId: 'amm1', currencyCode: 'YES', amount: expect.closeToDecimal(-64.29) },
  //       { accountId: 'user1', currencyCode: 'YES', amount: expect.closeToDecimal(64.29) },
  //     ])
  //   })
  //   it('should return correct transactions for buying NO', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'NO' }))
  //     const transactions = await buy({
  //       fromAccountId: 'user1',
  //       ammAccountId: 'amm1',
  //       assetType: 'MARKET_OPTION',
  //       assetId: 'option-1',
  //       amount: new Decimal(50),
  //     })
  //     expect(transactions).toEqual([
  //       { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-50) },
  //       { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-50) },
  //       { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(50) },
  //       { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(50) },
  //       { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(-150) },
  //       { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(150) },
  //     ])
  //   })
  // })
  // // This is the inverse of the test for buying YES
  // it('should return correct transactions for selling YES', async () => {
  //   // Current probability ~= 0.80
  //   jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //     if (currencyCode === 'YES') return new Decimal(85.71)
  //     if (currencyCode === 'NO') return new Decimal(350)
  //     return new Decimal(0)
  //   })
  //   jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))
  //   const transactions = await sell({
  //     fromAccountId: 'user1',
  //     ammAccountId: 'amm1',
  //     assetType: 'MARKET_OPTION',
  //     assetId: 'option-1',
  //     amount: new Decimal(64.29),
  //   })
  //   expect(transactions).toEqual([
  //     { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-64.29) },
  //     { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(64.29) },
  //     { accountId: 'user1', currencyCode: 'YES', amount: expect.closeToDecimal(50) },
  //     { accountId: 'user1', currencyCode: 'NO', amount: expect.closeToDecimal(50) },
  //     { accountId: 'amm1', currencyCode: 'YES', amount: expect.closeToDecimal(-50) },
  //     { accountId: 'amm1', currencyCode: 'NO', amount: expect.closeToDecimal(-50) },
  //   ])
  // })
  // // This is the inverse of the test for buying NO
  // it('should return correct transactions for selling NO', async () => {
  //   // Current probability ~= 0.57
  //   jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //     if (currencyCode === 'YES') return new Decimal(150)
  //     if (currencyCode === 'NO') return new Decimal(200)
  //     return new Decimal(0)
  //   })
  //   jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'NO' }))
  //   const transactions = await sell({
  //     fromAccountId: 'user1',
  //     ammAccountId: 'amm1',
  //     assetType: 'MARKET_OPTION',
  //     assetId: 'option-1',
  //     amount: new Decimal(150),
  //   })
  //   expect(transactions).toEqual([
  //     { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-150) },
  //     { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(150) },
  //     { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(50) },
  //     { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(50) },
  //     { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(-50) },
  //     { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(-50) },
  //   ])
  // })
  // describe('costToHitProbability', () => {
  //   it('should return zero cost and returnedShares for same probability', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     const result = await costToHitProbability({
  //       ammAccountId: 'amm1',
  //       probability: new Decimal(0.75),
  //       maxAmount: new Decimal(100),
  //     })
  //     expect(result).toEqual({
  //       cost: new Decimal(0),
  //       returnedShares: new Decimal(0),
  //     })
  //   })
  //   it('should return correct cost and returnedShares for increasing probability', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     const result = await costToHitProbability({
  //       ammAccountId: 'amm1',
  //       probability: new Decimal(0.8),
  //       maxAmount: new Decimal(100),
  //     })
  //     expect(result).toEqual({
  //       cost: expect.closeToDecimal(46.41),
  //       returnedShares: expect.closeToDecimal(59.81),
  //     })
  //   })
  //   it('should return correct cost and returnedShares for increasing probability to max', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     const result = await costToHitProbability({
  //       ammAccountId: 'amm1',
  //       probability: new Decimal(0.99),
  //       maxAmount: new Decimal(100),
  //     })
  //     expect(result).toEqual({
  //       cost: expect.closeToDecimal(100),
  //       returnedShares: expect.closeToDecimal(125),
  //     })
  //   })
  //   it('should return correct cost and returnedShares for decreasing probability', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     const result = await costToHitProbability({
  //       ammAccountId: 'amm1',
  //       probability: new Decimal(0.5),
  //       maxAmount: new Decimal(100),
  //     })
  //     expect(result).toEqual({
  //       cost: expect.closeToDecimal(73.21),
  //       returnedShares: expect.closeToDecimal(200),
  //     })
  //   })
  //   it('should return correct cost and returnedShares for decreasing probability to max', async () => {
  //     // Current probability = 0.75
  //     jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
  //       if (currencyCode === 'YES') return new Decimal(100)
  //       if (currencyCode === 'NO') return new Decimal(300)
  //       return new Decimal(0)
  //     })
  //     const result = await costToHitProbability({
  //       ammAccountId: 'amm1',
  //       probability: new Decimal(0.25),
  //       maxAmount: new Decimal(100),
  //     })
  //     expect(result).toEqual({
  //       cost: expect.closeToDecimal(100),
  //       returnedShares: expect.closeToDecimal(250),
  //     })
  //   })
  // })
  // describe('addLiquidity', () => {
  //   it('should return correct transactions for adding liquidity', async () => {
  //     const transactions = await addLiquidity({
  //       fromAccountId: 'user1',
  //       ammAccountId: 'amm1',
  //       amount: new Decimal(50),
  //       options: [
  //         { currencyCode: 'YES', liquidityProbability: new Decimal(0.5) },
  //         { currencyCode: 'NO', liquidityProbability: new Decimal(0.5) },
  //       ],
  //     })
  //     expect(transactions).toEqual(
  //       expect.arrayContaining([
  //         { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-50) },
  //         { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-50) },
  //         { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(50) },
  //         { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(50) },
  //         { accountId: 'amm1', currencyCode: 'LPB', amount: new Decimal(-50) },
  //         { accountId: 'user1', currencyCode: 'LPB', amount: new Decimal(50) },
  //       ])
  //     )
  //   })
  // })
})
