'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { OctagonXIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createMarketCancel } from '@play-money/api-helpers/client'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Button } from '@play-money/ui/button'
import { Checkbox } from '@play-money/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Textarea } from '@play-money/ui/textarea'
import { toast } from '@play-money/ui/use-toast'
import { ExtendedMarket } from '../types'

const FormSchema = z.object({
  reason: z.string().min(1, { message: 'You are required to provide a reason' }),
  notMalice: z.boolean().refine((value) => value === true, {
    message: 'You must confirm that this action is not malicious',
  }),
  // confirmText: z.string().refine((value) => value === 'CANCEL MARKET', {
  //   message: 'You must confirm that this action is not malicious',
  // }),
})

type FormData = z.infer<typeof FormSchema>

export const CancelMarketDialog = ({
  open,
  onClose,
  onSuccess,
  market,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  market: ExtendedMarket
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createMarketCancel({ marketId: market.id, reason: data.reason })

      toast({ title: 'Market canceled successfully' })
      form.reset()
      onClose()
      onSuccess?.()
    } catch (error: any) {
      console.error('Failed to resolve market:', error)
      toast({
        title: 'There was an issue canceling the market',
        description: error.message || 'Please retry',
        variant: 'destructive',
      })
    }
  }

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Market "{market.question}"</DialogTitle>
        </DialogHeader>

        <Alert variant="destructive">
          <OctagonXIcon className="h-4 w-4" />

          <AlertTitle>This action cannot be undone.</AlertTitle>
          <AlertDescription>
            All trades, winnings, liquidity additions and bonuses will be reveresed and funds will be returned to each
            user.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for cancelation:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="I am canceling this market because..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="confirmText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type "CANCEL MARKET"</FormLabel>
                  <FormControl>
                    <Input placeholder="CANCEL MARKET" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="notMalice"
              render={({ field }) => (
                <FormItem className="pb-4">
                  <div className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>I am not canceling this market out of malice or deception</FormLabel>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" loading={isSubmitting} className="w-full">
              Resolve
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
