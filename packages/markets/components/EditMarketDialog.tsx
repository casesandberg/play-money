'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { updateMarket } from '@play-money/api-helpers/client'
import { MarketSchema, Market } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Editor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'

const FormSchema = MarketSchema.pick({ question: true, description: true, closeDate: true })

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

export const EditMarketDialog = ({
  open,
  onClose,
  onSuccess,
  market,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  market: Market
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: market.question,
      description: market.description || '<p></p>',
      closeDate: market.closeDate,
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  const onSubmit = async (data: FormData) => {
    try {
      const changedData = getDirtyValues(form.formState.dirtyFields, data)
      await updateMarket({ marketId: market.id, body: changedData })
      toast({ title: 'Market edited successfully' })
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to edit market:', error)
      toast({
        title: 'There was an issue editing the market',
        description: error.message ?? 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Market</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Question</FormLabel> */}
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution criteria</FormLabel>
                  <FormControl>
                    <div className="min-h-[80px]">
                      <Editor
                        inputClassName="border text-sm p-3 min-h-[80px]"
                        placeholder="Description..."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closeDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Close Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      className="w-auto"
                      onChange={(e) => {
                        try {
                          format(e.target.value, "yyyy-MM-dd'T'hh:mm") // Throws error if invalid date
                          field.onChange(new Date(e.target.value))
                        } catch (error) {
                          console.error('Failed to parse date:', error)
                        }
                      }}
                      value={field.value ? format(field.value, "yyyy-MM-dd'T'hh:mm") : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isDirty || !isValid} loading={isSubmitting} type="submit">
              Publish market edits
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
