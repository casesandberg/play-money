import { faker } from '@faker-js/faker'
import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react'
import React from 'react'
import { SWRProvider } from '@play-money/api-helpers/components/SWRProvider'
import { SessionProvider } from '@play-money/auth/components/SessionProvider'
import { mockUser } from '@play-money/database/mocks'
import '@play-money/ui/styles.css'
import { Toaster } from '@play-money/ui/toaster'
import { TooltipProvider } from '@play-money/ui/tooltip'
import { UserProvider } from '@play-money/users/context/UserContext'
import '../../web/app/globals.css'
import MockDate from '../src/mockdate'
import { allModes } from './modes'

faker.seed(10191)
MockDate.set('2001-11-22')

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    chromatic: {
      modes: allModes,
    },
    viewport: {
      viewports: {
        small: { name: 'Small', styles: { width: '480px', height: '60px' } },
        large: { name: 'Large', styles: { width: '1280px', height: '1000px' } },
      },
    },

    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#1E293B' },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => {
      const user = mockUser()
      const session = { user, expires: '2022-01-01T00:00:00Z' }

      return (
        <SWRProvider>
          <SessionProvider session={session}>
            <UserProvider user={user}>
              <TooltipProvider>
                <Story />
              </TooltipProvider>
            </UserProvider>
          </SessionProvider>
          <Toaster />
        </SWRProvider>
      )
    },
  ],
}

export default preview
