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
      mockExtendedMarket({
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
    ],
  },
}
