/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        mamazul: {
          bg: '#FFF9F2',
          text: '#3D405B',
          coral: '#E07A5F',
          mint: '#81B29A',
          sand: '#F2CC8F',
          cream: '#F4F1DE'
        }
      }
    },
  },
  plugins: [],
}
