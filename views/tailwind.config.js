// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
       "primary": "#f5cd15",
        "bm-ter2": "#fff",
        "bm-ter1": "#f9f9f9",
        "bm-secondry": "#000",
        "base-gray-40": "#b5bec6",
        "bm-ter3": "rgba(217, 217, 217, 0.5)",
        "base-gray-80": "#4a5660",
        "secondary-100": "#f04d23",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      screens: {
        xs: "480px",
        ss: "620px",
        sm: "768px",
       
        md: "1060px",
        lg: "1200px",
        xl: "1700px",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
