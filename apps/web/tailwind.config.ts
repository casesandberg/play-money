// tailwind config is required for editor support

import type { Config } from 'tailwindcss'
import sharedConfig from '@play-money/config/tailwind/tailwind.config'

const config: Pick<Config, 'content' | 'presets'> = {
  content: ['./app/**/*.tsx', '../../packages/**/*.tsx'],
  presets: [sharedConfig],
}

export default config
