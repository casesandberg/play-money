import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket, mockTransactionWithEntries } from '@play-money/database/mocks'
import { MarketTradesPage } from './MarketTradesPage'

const meta = {
  component: MarketTradesPage,
  tags: ['autodocs'],
} satisfies Meta<typeof MarketTradesPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    market: mockExtendedMarket(),
    transactions: [mockTransactionWithEntries(), mockTransactionWithEntries(), mockTransactionWithEntries()],
    pageInfo: {
      hasNextPage: true,
      total: 100,
    },
  },
}

export const Empty: Story = {
  args: {
    market: mockExtendedMarket(),
    transactions: [],
    pageInfo: {
      hasNextPage: false,
      total: 0,
    },
  },
}
