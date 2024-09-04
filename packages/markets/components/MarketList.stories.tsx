import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import Decimal from 'decimal.js'
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
      mockExtendedMarket(),
      mockExtendedMarket(),
      mockExtendedMarket(),
      mockExtendedMarket(),
      mockExtendedMarket(),
    ],
  },
}

export const WithLongText: Story = {
  args: {
    markets: [
      mockExtendedMarket({
        question: faker.lorem.sentence(30),
        options: [
          { ...mockMarketOption({ id: '1', name: faker.lorem.sentence(8) }), probability: new Decimal(0.65) },
          { ...mockMarketOption({ id: '2', name: faker.lorem.sentence(8) }), probability: new Decimal(0.35) },
        ],
        marketResolution: {
          ...mockMarketResolution(),
          resolution: {
            ...mockMarketOption({
              id: '2',
              name: faker.lorem.sentence(8),
              color: '#EC4899',
            }),
            probability: new Decimal(0.65),
          },
          resolvedBy: mockUser(),
        },
      }),
      mockExtendedMarket({
        question: faker.lorem.sentence(30),
        options: [
          { ...mockMarketOption({ id: '1', name: faker.lorem.sentence(8) }), probability: new Decimal(0.65) },
          { ...mockMarketOption({ id: '2', name: faker.lorem.sentence(8) }), probability: new Decimal(0.35) },
        ],
        marketResolution: {
          ...mockMarketResolution(),
          resolution: {
            ...mockMarketOption({
              id: '2',
              name: faker.lorem.sentence(8),
              color: '#EC4899',
            }),
            probability: new Decimal(0.65),
          },
          resolvedBy: mockUser(),
        },
      }),
    ],
  },
}
