'use client'

import { debounce } from 'lodash'
import React from 'react'
import { useForm } from 'react-hook-form'
import { getUserCheckUsername, updateMe } from '@play-money/api-helpers/client'
import { User } from '@play-money/database'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
import { Button } from '@play-money/ui/button'
import { Combobox } from '@play-money/ui/combobox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Textarea } from '@play-money/ui/textarea'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '../context/UserContext'

// Monkey patch for es2022
declare namespace Intl {
  type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit'

  function supportedValuesOf(input: Key): string[]

  type DateTimeFormatOptions = {
    timeZone: string
    timeZoneName: string
  }
  class DateTimeFormat {
    constructor(locale: string, options: DateTimeFormatOptions)
    format(date: Date): string
  }
}

type ProfileFormValues = Pick<User, 'username' | 'bio' | 'avatarUrl' | 'displayName' | 'timezone'>

export function SettingsProfileForm({
  hasImageUpload = false,
  onImageUpload,
}: {
  hasImageUpload?: boolean
  onImageUpload?: (file: FormData) => Promise<string>
}) {
  const { user, setUser } = useUser()
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      displayName: user?.displayName ?? '',
      timezone: user?.timezone ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  async function onSubmit(data: ProfileFormValues) {
    try {
      const user = await updateMe(data)

      setUser(user)
      toast({
        title: 'Your profile has been updated',
      })
    } catch (error) {
      toast({
        title: 'There was an error updating your profile',
        description: (error as Error).message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {hasImageUpload ? (
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-32">
                      <AvatarImage
                        alt={`@${user?.username}`}
                        src={value || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username}&scale=75`}
                      />
                      <AvatarFallback />
                    </Avatar>
                    <Input
                      {...field}
                      onChange={async (event) => {
                        const file = event.target.files?.[0]

                        if (file) {
                          const formData = new FormData()
                          formData.append('image', file)

                          const img = await onImageUpload?.(formData)
                          if (img) {
                            form.setValue('avatarUrl', img, { shouldValidate: true, shouldDirty: true })
                          }
                        }
                      }}
                      type="file"
                      className="w-64"
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="Display name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          rules={{
            validate: debounce(
              async (value: string) => {
                if (user?.username === value) {
                  return true
                }
                const { available, message } = await getUserCheckUsername({ username: value })
                return available || message || 'There is an error with that username'
              },
              500,
              { leading: true }
            ),
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>This is your username. It is unique to you on the site.</FormDescription>
              <FormMessage /> {/* TODO: @casesandberg Figure out why the validate error isnt being displayed */}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field: { value, ...restField } }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  value={value ?? ''}
                  {...restField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field: { ref, ...field } }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Combobox
                  buttonClassName="w-full"
                  {...field}
                  items={Intl.supportedValuesOf('timeZone').map((tz) => {
                    const offset = new Intl.DateTimeFormat('en-US', {
                      timeZone: tz,
                      timeZoneName: 'shortOffset',
                    })
                      .format(new Date())
                      .split(' ')
                      .pop()
                    return { value: tz, label: `${tz} (${offset})`, keywords: [...tz.split(' ')] }
                  })}
                />
              </FormControl>
              <FormDescription>
                This will be used for sending notifications, daily quest resets and displaying times in your local
                timezone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!isDirty || !isValid} loading={isSubmitting}>
          Update profile
        </Button>
      </form>
    </Form>
  )
}
