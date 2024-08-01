'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export function Combobox({
  items,
  defaultValue = '',
  value,
  placeholderLabel = 'Select...',
  emptyLabel = 'None found.',
  searchLabel = 'Search...',
  buttonClassName,
  onChange,
}: {
  items: Array<{ value: string; label: string }>
  defaultValue?: string
  value?: string
  placeholderLabel?: string
  emptyLabel?: string
  searchLabel?: string
  buttonClassName?: string
  onChange?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [innerValue, setInnerValue] = useState(defaultValue || value)

  useEffect(() => {
    if (value && value !== innerValue) {
      setInnerValue(value)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps -- we only care when the outer value changes

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn('justify-between', buttonClassName)}
          role="combobox"
          variant="outline"
        >
          {innerValue ? items.find((item) => item.value === innerValue)?.label : placeholderLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command
          filter={(rowValue, search, keywords) => {
            const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
            const normalizedValue = normalize(rowValue)
            const normalizedSearch = normalize(search)
            const normalizedKeywords = keywords?.map(normalize) || []

            const extendedValue = `${normalizedValue} ${normalizedKeywords.join(' ')}`
            return extendedValue.includes(normalizedSearch) ? 1 : 0
          }}
        >
          <CommandInput placeholder={searchLabel} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={(currentValue) => {
                    setInnerValue(currentValue === innerValue ? '' : currentValue)
                    onChange?.(currentValue === innerValue ? '' : currentValue)
                    setOpen(false)
                  }}
                  value={item.value}
                >
                  <Check className={cn('mr-2 h-4 w-4', innerValue === item.value ? 'opacity-100' : 'opacity-0')} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
