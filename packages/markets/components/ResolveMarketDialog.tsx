'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Button } from '@play-money/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@play-money/ui/dialog'
import { ReadMoreEditor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Label } from '@play-money/ui/label'
import { RadioGroup, RadioGroupItem } from '@play-money/ui/radio-group'
import { toast } from '@play-money/ui/use-toast'
import { ExtendedMarket } from './MarketOverviewPage'

const FormSchema = z.object({
  optionId: z.string().nonempty({ message: 'You must select an option' }),
  supportingLink: z.string().url({ message: 'Supporting link must be a valid URL' }).optional(),
})

type FormData = z.infer<typeof FormSchema>

export const ResolveMarketDialog = ({
  open,
  onClose,
  market,
}: {
  open: boolean
  onClose: () => void
  market: ExtendedMarket
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${market.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ optionId: data.optionId, supportingLink: data.supportingLink }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      toast({ title: 'Market resolved successfully' })
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Failed to resolve market:', error)
      toast({
        title: 'There was an issue resolving the market',
        description: 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Market "{market.question}"</DialogTitle>
        </DialogHeader>

        <ReadMoreEditor value={market.description} maxLines={6} editorProps={{ inputClassName: 'text-sm' }} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="optionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select the option to resolve as true:</FormLabel>
                  <FormControl>
                    <RadioGroup {...field} onValueChange={field.onChange}>
                      {market.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id}>{option.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supportingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Supporting link: <span className="text-primary">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="http://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Resolve
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
