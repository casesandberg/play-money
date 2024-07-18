import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { mockNotification } from '@play-money/database/mocks'
import { NotificationItem } from './NotificationItem'

const meta = {
  component: NotificationItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    notification: mockNotification() as unknown as Story['args']['notification'],
    unread: true,
    count: 1,
  },
}
