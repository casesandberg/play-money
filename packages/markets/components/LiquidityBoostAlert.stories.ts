import type { Meta, StoryObj } from '@storybook/react'
import { LiquidityBoostAlert } from './LiquidityBoostAlert'

const meta = {
  component: LiquidityBoostAlert,
  tags: ['autodocs'],
} satisfies Meta<typeof LiquidityBoostAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClick: console.log,
  },
}
