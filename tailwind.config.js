/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D6EFD",
        "dark-blue": "#0B3EBE",
        navy: "#0A1931",
        teal: "#0E9F9A",
        "light-blue": "#E8F0FE",
      },
    },
  },
  plugins: [],
};