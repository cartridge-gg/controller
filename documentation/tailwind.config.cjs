/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./docs/**/*.{html,md,mdx,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffc52a", // Custom primary color
      },
    },
  },
  plugins: [],
};
