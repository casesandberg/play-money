module.exports = {
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
  printWidth: 120,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@(play-money)/(.*)$', '^~/(.*)$', '^[./]'],
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  tailwindConfig: './packages/config/tailwind/tailwind.config.ts',
}
