'use client'

import { debounce } from 'lodash'
import React from 'react'
import { useForm } from 'react-hook-form'
import { User } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Combobox } from '@play-money/ui/combobox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@play-money/ui/select'
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

// TODO: @casesandberg Generate this from OpenAPI schema
async function checkUsernameAvailability(username: string): Promise<{ available: boolean; message?: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/check-username?username=${encodeURIComponent(username)}`,
    { credentials: 'include' }
  )
  return await response.json()
}

export function SettingsProfileForm() {
  const { user, setUser } = useUser()
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      displayName: user?.displayName ?? '',
      timezone: user?.timezone ?? '',
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  async function onSubmit(data: ProfileFormValues) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok || response.status >= 400) {
      const { message } = await response.json()
      toast({
        title: 'There was an error updating your profile',
        description: message,
      })
      return
    }

    const user = await response.json()

    setUser(user)
    toast({
      title: 'Your profile has been updated',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                const { available, message } = await checkUsernameAvailability(value)
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
          render={({ field }) => (
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
