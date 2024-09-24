import type { Meta, StoryObj } from '@storybook/react'
import { mockExtendedMarket } from '@play-money/database/mocks'
import { SelectedItemsProvider } from '../../ui/src/contexts/SelectedItemContext'
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
  },
  decorators: [
    (Story) => (
      <SelectedItemsProvider initialValue={['1']}>
        <Story />
      </SelectedItemsProvider>
    ),
  ],
}

export const NoOptionSelected: Story = {
  args: {
    market: mockExtendedMarket(),
    isResolved: false,
  },
  decorators: [
    (Story) => (
      <SelectedItemsProvider initialValue={['2']}>
        <Story />
      </SelectedItemsProvider>
    ),
  ],
}
