import colors from 'tailwindcss/colors'
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import plugin from 'tailwindcss/plugin'

export default {
  darkMode: 'class',
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus'])
    }),
    typography,
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: { fontSize: '26px' },
            h2: { fontSize: '22px' },
            h3: { fontSize: '18px' },
            'h1, h2, h3, h4': {
              fontWeight: 500,
              marginTop: '22px',
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              textDecoration: 'none',
            },
            code: { fontWeight: 400 },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            'ol, ul': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
              paddingInlineStart: '1.25em',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            a: { fontWeight: '400' },
            strong: { fontWeight: '400' },
            blockquote: {
              fontWeight: '300',
              fontStyle: 'normal',
            },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
          },
        },
        slate: { css: {} },
      },
      colors: {
        primary: 'var(--ui-primary)',
        secondary: 'var(--ui-secondary)',
        neutral: colors.slate[700],
        warn: 'var(--ui-warn)',
        'page-bg': 'var(--ui-page-bg)',
        'page-fg': 'var(--ui-page-fg)',
        'muted-fg': 'var(--ui-muted-fg)',
        'osa-fg': 'var(--ui-osa-fg)',
        'osa-hover': 'var(--ui-osa-hover)',
        surface: 'var(--ui-surface)',
        'surface-fg': 'var(--ui-surface-fg)',
        'surface-border': 'var(--ui-surface-border)',
        inset: 'var(--ui-inset)',
        'inset-fg': 'var(--ui-inset-fg)',
        'inset-border': 'var(--ui-inset-border)',
        activity: 'var(--ui-activity)',
        'activity-fg': 'var(--ui-activity-fg)',
        info: 'var(--ui-info)',
        'info-fg': 'var(--ui-info-fg)',
        success: 'var(--ui-success)',
        danger: 'var(--ui-danger)',
        'graph-primary': 'var(--ui-graph-primary)',
        'graph-secondary': 'var(--ui-graph-secondary)',
        'graph-highlight': 'var(--ui-graph-highlight)',
        osa: {
          50: '#f6f9fb',
          100: '#e2f0fc',
          200: '#c2dbf9',
          300: '#97b9f0',
          400: '#6e92e5',
          500: '#576edb',
          600: '#4751cb',
          700: '#373da9',
          800: '#26297b',
          900: '#161a4d',
          950: '#0d1030',
        },
        accent: {
          50: '#f9fafb',
          100: '#edf0fb',
          200: '#dad6f8',
          300: '#bab1ec',
          400: '#a087df',
          500: '#8762d3',
          600: '#6f46bf',
          700: '#53349b',
          800: '#39246d',
          900: '#201741',
          950: '#140e29',
        },
      },
    },
  },
} satisfies Config
