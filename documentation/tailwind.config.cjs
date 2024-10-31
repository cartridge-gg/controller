/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./docs/**/*.{html,md,mdx,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffc52a", // Custom primary color
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 5s linear infinite",
      },
    },
  },
  plugins: [],
};
