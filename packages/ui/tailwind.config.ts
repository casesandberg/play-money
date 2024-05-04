import type { Config } from 'tailwindcss'
import sharedConfig from '@play-money/tailwind-config'

const config = {
  content: ['./src/**/*.tsx'],
  prefix: '',
  presets: [sharedConfig],
} satisfies Config

export default config
