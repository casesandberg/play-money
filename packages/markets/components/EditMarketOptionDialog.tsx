'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PopoverClose } from '@radix-ui/react-popover'
import React from 'react'
import { CirclePicker } from 'react-color'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { updateMarketOption } from '@play-money/api-helpers/client'
import { MarketOptionSchema } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@play-money/ui/popover'
import { toast } from '@play-money/ui/use-toast'
import { ExtendedMarket } from '../types'

const FormSchema = MarketOptionSchema.pick({ name: true, color: true })

type FormData = z.infer<typeof FormSchema>

// Copied from https://github.com/orgs/react-hook-form/discussions/1991
function getDirtyValues<DirtyFields extends Record<string, unknown>, Values extends Record<keyof DirtyFields, unknown>>(
  dirtyFields: DirtyFields,
  values: Values
): Partial<typeof values> {
  const dirtyValues = Object.keys(dirtyFields).reduce((prev, key) => {
    if (!dirtyFields[key]) return prev

    return {
      ...prev,
      [key]:
        typeof dirtyFields[key] === 'object'
          ? getDirtyValues(dirtyFields[key] as DirtyFields, values[key] as Values)
          : values[key],
    }
  }, {})

  return dirtyValues
}

export const EditMarketOptionDialog = ({
  open,
  onClose,
  onSuccess,
  optionId,
  market,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  optionId: string
  market: ExtendedMarket
}) => {
  const selectedOption = market.options.find((o) => o.id === optionId)
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: selectedOption?.name,
      color: selectedOption?.color,
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  const onSubmit = async (data: FormData) => {
    try {
      const changedData = getDirtyValues(form.formState.dirtyFields, data)
      await updateMarketOption({ marketId: market.id, optionId: optionId, body: changedData })
      toast({ title: 'Market option edited successfully' })
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to edit market option:', error)
      toast({
        title: 'There was an issue editing the market option',
        description: error.message ?? 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Market Option</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option name</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block">Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="icon" variant="outline">
                          <div style={{ backgroundColor: field.value }} className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverClose>
                          <CirclePicker
                            onChange={console.log}
                            onChangeComplete={(color) => field.onChange(color.hex)}
                            color={field.value}
                          />
                        </PopoverClose>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button disabled={!isDirty || !isValid} loading={isSubmitting} type="submit">
              Publish market option edits
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
