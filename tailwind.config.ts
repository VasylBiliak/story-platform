import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'primary': 'var(--color-bg-primary)',
        'secondary': 'var(--color-bg-secondary)',
        // Text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        // Border colors
        'border': 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        // Accent colors
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-tertiary': 'var(--color-accent-tertiary)',
        // Dark theme
        'dark-bg': 'var(--color-dark-bg)',
        'dark-text': 'var(--color-dark-text)',
        'dark-border': 'var(--color-dark-border)',
      },
      fontFamily: {
        base: ["var(--font-base)"],
        alt: ["var(--font-alt)"],
        decorative: ["var(--font-decorative)"],
      },
      maxWidth: {
        'site': 'var(--max-width)',
      },
      borderRadius: {
        'sm': 'var(--border-radius-sm)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      animation: {
        'slide-bottom': 'slide-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
      },
      keyframes: {
        'slide-bottom': {
          '0%': { transform: 'translateY(-25%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;