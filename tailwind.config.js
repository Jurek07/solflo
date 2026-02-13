/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solana-inspired colors
        'sol-purple': '#9945FF',
        'sol-green': '#14F195',
        'sol-dark': '#0D0D0D',
        'sol-gray': '#1A1A1A',
      },
    },
  },
  plugins: [],
};
