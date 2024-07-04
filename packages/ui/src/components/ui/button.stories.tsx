import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, Clock, Trash } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const renderGroup: Story['render'] = (args) => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-4">
      <Button {...args}>{args.children}</Button>
      <Button {...args}>
        {args.children} <ArrowRight className="h-4 w-4" />
      </Button>
      <Button {...args}>
        <Clock className="h-4 w-4" /> {args.children}
      </Button>

      <Button {...args} size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex gap-4">
      <Button {...args} disabled>
        {args.children}
      </Button>
      <Button {...args} disabled>
        {args.children} <ArrowRight className="h-4 w-4" />
      </Button>
      <Button {...args} disabled>
        <Clock className="h-4 w-4" /> {args.children}
      </Button>

      <Button {...args} disabled size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </div>

    <div className="flex gap-4">
      <Button {...args} loading>
        {args.children}
      </Button>
      <Button {...args} loading>
        {args.children} <ArrowRight className="h-4 w-4" />
      </Button>
      <Button {...args} loading>
        <Clock className="h-4 w-4" /> {args.children}
      </Button>

      <Button {...args} loading size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  </div>
)

export const Primary: Story = {
  render: renderGroup,
  args: {
    children: 'Primary button',
  },
}

export const Secondary: Story = {
  render: renderGroup,
  args: {
    variant: 'secondary',
    children: 'Secondary button',
  },
}

export const Heavy: Story = {
  render: renderGroup,
  args: {
    variant: 'heavy',
    children: 'Black button',
  },
}

export const Outline: Story = {
  render: renderGroup,
  args: {
    variant: 'outline',
    children: 'Outline button',
  },
}

export const Ghost: Story = {
  render: renderGroup,
  args: {
    variant: 'ghost',
    children: 'Outline button',
  },
}
