/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F7F0E6',
        ink: '#111827',
        bt3Red: '#D61F26',
        lightBlue: '#5BC0EB',
        gold: '#CBA135',
      },
    },
  },
  plugins: [],
}

