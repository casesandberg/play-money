import type { Meta, StoryObj } from '@storybook/react'
import { CurrencyDisplay } from './CurrencyDisplay'

const meta = {
  component: CurrencyDisplay,
  tags: ['autodocs'],
} satisfies Meta<typeof CurrencyDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
  },
}

export const FontSmall: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
    className: 'text-sm',
  },
}

export const FontXSmall: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
    className: 'text-xs',
  },
}

export const FontLarge: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
    className: 'text-lg',
  },
}

export const Short: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
    isShort: true,
  },
}

export const ShortMillions: Story = {
  args: {
    value: 1949212.24,
    currencyCode: 'PRIMARY',
    isShort: true,
  },
}

export const EnsureNoWrap: Story = {
  args: {
    value: 13492.24,
    currencyCode: 'PRIMARY',
  },
  decorators: [
    (Story) => (
      <div className="w-4">
        <Story />
      </div>
    ),
  ],
}
