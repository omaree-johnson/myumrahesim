/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // Use system preference for dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundColor: {
        'background': 'var(--background)',
      },
      textColor: {
        'foreground': 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
