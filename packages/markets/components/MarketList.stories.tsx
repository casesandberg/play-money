import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket, mockMarketOption, mockMarketResolution, mockUser } from '@play-money/database/mocks'
import { MarketList } from './MarketList'

const meta = {
  component: MarketList,
  tags: ['autodocs'],
} satisfies Meta<typeof MarketList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    markets: [
      {
        ...mockExtendedMarket(),
        commentCount: 4,
        liquidityCount: 4200,
        uniqueTraderCount: 4,
      },
      {
        ...mockExtendedMarket(),
        commentCount: 0,
        liquidityCount: 1000,
        uniqueTraderCount: 0,
      },
      {
        ...mockExtendedMarket(),
        commentCount: 0,
        liquidityCount: 1200,
        uniqueTraderCount: 1,
      },
      {
        ...mockExtendedMarket(),
        commentCount: 2,
        liquidityCount: 1400200,
        uniqueTraderCount: 4124,
      },
      {
        ...mockExtendedMarket(),
        commentCount: 70,
        liquidityCount: 1295,
        uniqueTraderCount: 3,
      },
    ],
  },
}

export const WithLongText: Story = {
  args: {
    markets: [
      {
        ...mockExtendedMarket({
          question: faker.lorem.sentence(30),
          options: [
            mockMarketOption({ id: '1', name: faker.lorem.sentence(8), currencyCode: 'YES' }),
            mockMarketOption({ id: '2', name: faker.lorem.sentence(8), currencyCode: 'NO' }),
          ],
          marketResolution: {
            ...mockMarketResolution(),
            resolution: mockMarketOption({
              id: '2',
              name: faker.lorem.sentence(8),
              currencyCode: 'NO',
              color: '#EC4899',
            }),
            resolvedBy: mockUser(),
          },
        }),
        commentCount: 4,
        liquidityCount: 4200,
        uniqueTraderCount: 4,
      },
      {
        ...mockExtendedMarket({
          question: faker.lorem.sentence(30),
          options: [
            mockMarketOption({ id: '1', name: faker.lorem.sentence(8), currencyCode: 'YES' }),
            mockMarketOption({ id: '2', name: faker.lorem.sentence(8), currencyCode: 'NO' }),
          ],
          marketResolution: {
            ...mockMarketResolution(),
            resolution: mockMarketOption({ id: '2', name: faker.lorem.sentence(8), currencyCode: 'YES' }),
            resolvedBy: mockUser(),
          },
        }),
        commentCount: 0,
        liquidityCount: 1000,
        uniqueTraderCount: 0,
      },
    ],
  },
}
