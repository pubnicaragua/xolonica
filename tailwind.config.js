/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-deep': '#003893',
        'blue-light': '#0057B7',
        'yellow-nica': '#F4B942',
        'green-nica': '#2D9B4F',
      },
    },
  },
  plugins: [],
};
