'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { updateList } from '@play-money/api-helpers/client'
import { List, ListSchema } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Editor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { MultiSelect } from '@play-money/ui/multi-select'
import { toast } from '@play-money/ui/use-toast'

const FormSchema = ListSchema.pick({ title: true, description: true, tags: true })

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

export const EditListDialog = ({
  open,
  onClose,
  onSuccess,
  list,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  list: List
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: list.title,
      description: list.description ?? '<p></p>',
      tags: list.tags,
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  const onSubmit = async (data: FormData) => {
    try {
      const changedData = getDirtyValues(form.formState.dirtyFields, data)
      await updateList({ listId: list.id, body: changedData })
      toast({ title: 'List edited successfully' })
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to edit list:', error)
      toast({
        title: 'There was an issue editing the list',
        description: error.message ?? 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
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
                        value={field.value ?? ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={value?.map((v) => ({ value: v, label: v }))}
                      onChange={(values) => onChange(values?.map((v) => v.value))}
                      hideClearAllButton
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={!isDirty || !isValid} loading={isSubmitting} type="submit">
              Publish list edits
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
