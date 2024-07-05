import type { Meta, StoryObj } from '@storybook/react'
import { mockComment, mockUser } from '@play-money/database/mocks'
import { CommentItem } from './CommentItem'

const meta = {
  component: CommentItem,
  tags: ['autodocs'],
} satisfies Meta<typeof CommentItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    activeUserId: 'user-1',
    comment: {
      ...mockComment(),
      author: mockUser(),
      reactions: [],
    },
    isHighlighted: false,
    onEmojiSelect: console.log,
    onCreateReply: async () => console.log('create reply'),
    onEdit: async () => console.log('edit'),
    onDelete: console.log,
  },
}
