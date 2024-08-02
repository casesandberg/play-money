import type { Meta, StoryObj } from '@storybook/react'
import { QuestCard } from './QuestCard'

const meta = {
  component: QuestCard,
  tags: ['autodocs'],
} satisfies Meta<typeof QuestCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    quests: [
      { title: 'Quest 1', completed: false, award: 200, href: '/' },
      { title: 'Quest 2 really long quest name here that will overflow', completed: false, award: 1500, href: '/' },
      { title: 'Quest 3 also has a really long name that will overflow', completed: true, award: 500, href: '/' },
      { title: 'Quest 4', completed: true, award: 500, href: '/' },
    ],
  },
}

export const AllComplete: Story = {
  args: {
    quests: [
      { title: 'Quest 1', completed: true, award: 200, href: '/' },
      { title: 'Quest 2 really long quest name here that will overflow', completed: true, award: 1500, href: '/' },
      { title: 'Quest 3 also has a really long name that will overflow', completed: true, award: 500, href: '/' },
      { title: 'Quest 4', completed: true, award: 500, href: '/' },
    ],
  },
}
