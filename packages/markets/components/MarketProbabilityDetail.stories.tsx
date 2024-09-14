import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket, mockMarketOption, mockTransactionWithEntries } from '@play-money/database/mocks'
import { MarketProbabilityDetail } from './MarketProbabilityDetail'

const meta = {
  component: MarketProbabilityDetail,
  tags: ['autodocs'],
} satisfies Meta<typeof MarketProbabilityDetail>

export default meta
type Story = StoryObj<typeof meta>

const renderGroup: Story['render'] = (args) => (
  <div className="flex flex-col gap-4">
    <MarketProbabilityDetail {...args} />
    <MarketProbabilityDetail {...args} size="sm" />
  </div>
)

export const Default: Story = {
  render: renderGroup,
  args: {
    options: [
      mockMarketOption({ probability: 62.12 }),
      mockMarketOption({ probability: 37.88, createdAt: new Date() }),
    ],
  },
}

export const OneOption: Story = {
  render: renderGroup,
  args: {
    options: [mockMarketOption({ probability: 37.88 })],
  },
}

export const MultipleOptions: Story = {
  render: renderGroup,
  args: {
    options: [
      mockMarketOption({ probability: 31.06 }),
      mockMarketOption({ probability: 37.88 }),
      mockMarketOption({ probability: 31.06 }),
    ],
  },
}

export const Min: Story = {
  render: renderGroup,
  args: {
    options: [mockMarketOption({ probability: 0.42 })],
  },
}

export const Max: Story = {
  render: renderGroup,
  args: {
    options: [mockMarketOption({ probability: 99.62 })],
  },
}
