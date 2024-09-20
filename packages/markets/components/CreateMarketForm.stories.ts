import type { Meta, StoryObj } from '@storybook/react'
import { CreateMarketForm } from './CreateMarketForm'

const meta = {
  component: CreateMarketForm,
  tags: ['autodocs'],
} satisfies Meta<typeof CreateMarketForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    colors: [
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
      '#f44336',
    ],
  },
}
