/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {

      colors:{},
      container:{
        center: true,
        padding:{
          DEFAULT:"1 rem",
          sm: "2 rem",
          lg: "4 rem",
          xl: "5 rem",
          "2xl": "6 rem"
        }

      }

    },
  },
  plugins: [],
}

