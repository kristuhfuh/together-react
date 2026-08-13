import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        bg: '#FBF8F4',
        surface: '#FFFFFF',
        's2': '#F7F4F0',
        lavender: { DEFAULT: '#C4B5E0', light: '#EDE8F5', dark: '#9B88C8' },
        blush:    { DEFAULT: '#EFC5CB', light: '#FBF1F3', dark: '#D9909B' },
        cream:    '#F9F3E8',
        gold:     '#D4A853',
        navy:     { DEFAULT: '#2B3A4A', mid: '#4A5568' },
        muted:    { DEFAULT: '#9B9BAA', light: '#E8E5F0' },
        divider:  '#EEEAE6',
        ok:       { DEFAULT: '#7CB98F', light: '#E8F4EC' },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(43,58,74,.06)',
        md: '0 4px 16px rgba(43,58,74,.10)',
        lg: '0 8px 32px rgba(43,58,74,.14)',
        lav: '0 4px 20px rgba(196,181,224,.45)',
      },
    },
  },
  plugins: [],
}

export default config
