import type { Config } from 'tailwindcss'
import sharedConfig from '@play-money/config/tailwind/tailwind.config'

const config = {
  content: ['./src/**/*.tsx'],
  prefix: '',
  presets: [sharedConfig],
} satisfies Config

export default config
