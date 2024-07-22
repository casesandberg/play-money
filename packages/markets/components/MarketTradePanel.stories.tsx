import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket } from '@play-money/database/mocks'
import { MarketTradePanel } from './MarketTradePanel'
import { SidebarProvider } from './SidebarContext'

const meta = {
  component: MarketTradePanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarketTradePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    market: mockExtendedMarket(),
    isResolved: false,
    activeOptionId: '1',
  },
}

export const NoOptionSelected: Story = {
  args: {
    market: mockExtendedMarket(),
    isResolved: false,
    activeOptionId: '2',
  },
}
