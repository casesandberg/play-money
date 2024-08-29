import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket, mockTransactionWithEntries } from '@play-money/database/mocks'
import { MarketPositionsPage } from './MarketPositionsPage'

const meta = {
  component: MarketPositionsPage,
  tags: ['autodocs'],
} satisfies Meta<typeof MarketPositionsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    market: mockExtendedMarket(),
    transactions: [mockTransactionWithEntries(), mockTransactionWithEntries(), mockTransactionWithEntries()],
  },
}

export const Empty: Story = {
  args: {
    market: mockExtendedMarket(),
    transactions: [],
  },
}
