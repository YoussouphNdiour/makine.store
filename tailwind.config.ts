import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── V1 — Dark Gold Editorial ── */
        'makine-gold':       '#C9A96E',
        'makine-gold-light': '#E8C98A',
        'makine-gold-dim':   '#A07840',
        'makine-ink':        '#0A0A0A',
        'makine-black':      '#1A1A1A',
        'makine-beige':      '#F4E0C8',
        'makine-cream':      '#FDFAF6',
        'makine-text':       '#2C2C2C',
        'makine-muted':      '#8A7A6A',
        'makine-pink':       '#E8A4B8',
        'wave-blue':         '#0091FF',
        'om-orange':         '#FF6600',
        /* ── V2 — Rose Petal (from logo) ── */
        'rose-snow':    '#FDF6F7',
        'rose-petal':   '#FAE9EC',
        'rose-blush':   '#EFC6CB',
        'rose-medium':  '#D4898E',
        'rose-deep':    '#A03048',
        'rose-wine':    '#6B1E2E',
        'rose-text':    '#2C1A1E',
        'rose-muted':   '#8A6068',
        'rose-cream':   '#FBF0F1',
        /* ── V3 — Dark Luxury Glassmorphism ── */
        'lux-void':     '#06060e',
        'lux-deep':     '#0c0b18',
        'lux-surface':  '#13111f',
        'lux-card':     '#1a1829',
        'lux-border':   'rgba(255,255,255,0.08)',
        'lux-gold':     '#d4a96a',
        'lux-gold-lt':  '#f0d9a8',
        'lux-gold-dim': '#9a7040',
        'lux-rose':     '#e8b4be',
        'lux-rose-d':   '#c9516e',
        'lux-text':     '#f0ede8',
        'lux-muted':    '#8a8498',
        'lux-shimmer':  '#c9a86c',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans:  ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '8xl': ['6rem',   { lineHeight: '1' }],
        '9xl': ['8rem',   { lineHeight: '1' }],
        '10xl':['10rem',  { lineHeight: '1' }],
      },
      boxShadow: {
        'gold-sm': '0 4px 16px rgba(201, 169, 110, 0.2)',
        'gold-md': '0 8px 32px rgba(201, 169, 110, 0.3)',
        'gold-lg': '0 16px 64px rgba(201, 169, 110, 0.25)',
        'card':    '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.12)',
        'rose-sm': '0 4px 16px rgba(160, 48, 72, 0.12)',
        'rose-md': '0 8px 32px rgba(160, 48, 72, 0.18)',
        'rose-lg': '0 16px 64px rgba(160, 48, 72, 0.22)',
        'rose-card': '0 2px 16px rgba(160, 48, 72, 0.08), 0 0 1px rgba(160, 48, 72, 0.06)',
        'rose-card-hover': '0 20px 60px rgba(160, 48, 72, 0.14)',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #E8C98A, #C9A96E, #A07840)',
        'dark-gradient':  'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        'hero-overlay':   'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.2) 100%)',
        'card-overlay':   'linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0) 60%)',
        'rose-gradient':  'linear-gradient(135deg, #FAE9EC 0%, #EFC6CB 40%, #A03048 100%)',
        'rose-hero':      'linear-gradient(to bottom, rgba(253,246,247,0.15) 0%, rgba(160,48,72,0.55) 100%)',
        'rose-card-ov':   'linear-gradient(to top, rgba(107,30,46,0.85) 0%, rgba(160,48,72,0.3) 60%, transparent 100%)',
        'petal-gradient': 'linear-gradient(160deg, #FDF6F7 0%, #FAE9EC 50%, #EFC6CB 100%)',
        'lux-gradient':   'linear-gradient(135deg, #0c0b18 0%, #06060e 50%, #13111f 100%)',
        'lux-gold-grad':  'linear-gradient(135deg, #f0d9a8 0%, #d4a96a 50%, #9a7040 100%)',
        'lux-rose-grad':  'linear-gradient(135deg, #e8b4be 0%, #c9516e 100%)',
        'lux-glass':      'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      },
    },
  },
  plugins: [],
}

export default config
