/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surfaceBorder: 'var(--color-border)',
        textMain: 'var(--color-text-main)',
        textMuted: 'var(--color-text-muted)',
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#334155',
          600: '#1e293b',
          700: '#0f172a',
          800: '#020617',
        },
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
