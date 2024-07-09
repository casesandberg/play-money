import type { Meta, StoryObj } from '@storybook/react'
import { mockComment, mockMarket, mockUser } from '@play-money/database/mocks'
import { EditMarketDialog } from './EditMarketDialog'

const meta = {
  component: EditMarketDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof EditMarketDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onClose: console.log,
    onSuccess: console.log,
    market: mockMarket(),
  },
}
