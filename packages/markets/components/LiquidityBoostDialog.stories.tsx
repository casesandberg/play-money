import type { Meta, StoryObj } from '@storybook/react'
import { mockMarket } from '@play-money/database/mocks'
import { LiquidityBoostDialog } from './LiquidityBoostDialog'

const meta = {
  component: LiquidityBoostDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof LiquidityBoostDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onClose: console.log,
    onSuccess: console.log,
    market: mockMarket(),
    stats: {
      totalLiquidity: 1200,
      lpUserCount: 2,
      traderBonusPayouts: 450,
      positions: {},
      earnings: {
        traderBonusPayouts: 297,
      },
    },
  },
}
