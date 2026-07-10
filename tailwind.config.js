/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07070b',
        panel: '#0d0d14',
        line: '#1e1e2a',
        neon: '#00e5ff',
        gold: '#ffc857',
        dim: '#8b8b9e',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(0, 229, 255, 0.35)',
        gold: '0 0 24px rgba(255, 200, 87, 0.35)',
      },
    },
  },
  plugins: [],
}
