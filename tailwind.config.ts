import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0a1f',
        cardBg: '#1a0d2e',
        accent: '#fb7185',
        secondary: '#d946ef',
        success: '#a855f7',
      },
    },
  },
  plugins: [],
};

export default config;
