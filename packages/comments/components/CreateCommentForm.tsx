import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CommentSchema } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Card } from '@play-money/ui/card'
import { Editor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@play-money/ui/form'
import { cn } from '@play-money/ui/utils'

const FormSchema = CommentSchema.pick({ content: true })

type FormData = z.infer<typeof FormSchema>

export function CreateCommentForm({
  initialContent,
  variant = 'default',
  startCollapsed = false,
  focusOnRender,
  onSubmit,
  onCancel,
}: {
  initialContent?: string
  variant?: 'default' | 'reply' | 'edit'
  startCollapsed?: boolean
  focusOnRender?: boolean
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: initialContent || '<p></p>',
    },
  })

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data.content)
  }

  useEffect(
    function resetFormAfterSubmit() {
      if (form.formState.isSubmitSuccessful) {
        form.reset({ content: '<p></p>' })
      }
    },
    [form.formState]
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Card className="group ring-offset-background focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field: { ref: _, ...field } }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Editor
                      placeholder={
                        variant === 'reply'
                          ? 'Write a reply...'
                          : variant === 'edit'
                            ? 'Edit comment...'
                            : 'Write a comment...'
                      }
                      className="min-h-14"
                      focusOnRender={focusOnRender}
                      shortcuts={{
                        'Mod-Enter': () => {
                          if (form.formState.isDirty && form.formState.isValid) {
                            form.handleSubmit(handleSubmit)()
                          }
                          return true
                        },
                        Escape: () => {
                          if (!form.formState.isDirty) {
                            onCancel?.()
                          }
                          return true
                        },
                      }}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <div
            className={cn(
              '-mt-4 flex flex-row justify-end group-focus-within:flex',
              startCollapsed && 'hidden',
              form.formState.isDirty && 'flex'
            )}
          >
            {onCancel ? (
              <Button variant="ghost" type="button" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}

            <Button
              variant="ghost"
              type="submit"
              disabled={!form.formState.isDirty || !form.formState.isValid}
              loading={form.formState.isSubmitting}
            >
              {variant === 'reply' ? 'Reply' : variant === 'edit' ? 'Edit' : 'Comment'}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  )
}
