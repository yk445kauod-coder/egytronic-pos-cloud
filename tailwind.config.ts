import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: { DEFAULT: '#0f766e', dark: '#0b3d3a' } } } },
  plugins: [],
} satisfies Config
