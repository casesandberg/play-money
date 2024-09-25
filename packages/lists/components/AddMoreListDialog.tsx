'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { GavelIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createListMarket } from '@play-money/api-helpers/client'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { LOWEST_MARKET_LIQUIDITY_PRIMARY } from '@play-money/finance/economy'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Button } from '@play-money/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'
import { ExtendedList } from '../types'

const COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
]

const FormSchema = z.object({ question: z.string(), color: z.string() })
type FormData = z.infer<typeof FormSchema>

export const AddMoreListDialog = ({
  open,
  onClose,
  onSuccess,
  list,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  list: ExtendedList
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: '',
      color: _.shuffle(COLORS)[0],
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  const onSubmit = async (data: FormData) => {
    try {
      const colors = _.shuffle(COLORS)
      await createListMarket(
        { listId: list.id },
        {
          question: data.question,
          description: '',
          options: [
            { name: 'Yes', color: colors[0] },
            { name: 'No', color: colors[1] },
          ],
          closeDate: list.markets[0].market.closeDate,
          tags: list.markets[0].market.tags,
        }
      )
      toast({ title: 'Question added successfully' })
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to edit market option:', error)
      toast({
        title: 'There was an issue adding the question',
        description: error.message ?? 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new question</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-row items-end gap-1">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="Question" {...field} />
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
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="icon" variant="outline">
                            <div style={{ backgroundColor: field.value }} className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverClose>
                            <CirclePicker onChangeComplete={(color) => field.onChange(color.hex)} color={field.value} />
                          </PopoverClose>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            <Alert className="bg-muted/50">
              <GavelIcon className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>The list creator will also be able to resolve this question.</AlertDescription>
            </Alert>

            <Button disabled={!isDirty || !isValid} loading={isSubmitting} type="submit">
              <CurrencyDisplay value={LOWEST_MARKET_LIQUIDITY_PRIMARY} /> Create question
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
