import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Poppins"', 'sans-serif'],
        headline: ['"Poppins"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        'app-background': 'hsl(var(--app-background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Theme colors
        cork: 'hsl(var(--cork))',
        'cork-dark': 'hsl(var(--cork-dark))',
        cream: 'hsl(var(--cream))',
        'cream-dark': 'hsl(var(--cream-dark))',
        brown: 'hsl(var(--brown))',
        'brown-light': 'hsl(var(--brown-light))',
        'brown-dark': 'hsl(var(--brown-dark))',
        paper: 'hsl(var(--paper))',
        'paper-yellow': 'hsl(var(--paper-yellow))',
        'paper-blue': 'hsl(var(--paper-blue))',
        'paper-pink': 'hsl(var(--paper-pink))',
        'paper-green': 'hsl(var(--paper-green))',
        'light-paper-yellow': 'hsl(var(--light-paper-yellow))',
        'light-paper-blue': 'hsl(var(--light-paper-blue))',
        'light-paper-pink': 'hsl(var(--light-paper-pink))',
        'light-paper-green': 'hsl(var(--light-paper-green))',
        chalkboard: 'hsl(var(--chalkboard))',
        chalk: 'hsl(var(--chalk))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up-and-fade': {
          'from': { opacity: '0', transform: 'translateY(1rem)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        sway1: {
            '0%, 100%': { transform: 'rotate(-2deg)' },
            '50%': { transform: 'rotate(2deg)' },
        },
        sway2: {
            '0%, 100%': { transform: 'rotate(1deg)' },
            '50%': { transform: 'rotate(-1deg)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up-and-fade': 'slide-up-and-fade 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
