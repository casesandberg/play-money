'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { Check } from 'lucide-react'
import * as React from 'react'
import { cn } from '../../lib/utils'

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ',
  {
    variants: {
      variant: {
        default: 'border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-slate-600 data-[state=checked]:text-slate-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>
>(({ className, variant, ...props }, ref) => (
  <CheckboxPrimitive.Root className={checkboxVariants({ variant, className })} ref={ref} {...props}>
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4 stroke-[3px]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
