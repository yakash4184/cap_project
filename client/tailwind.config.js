/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        mist: "#eef4f1",
        accent: "#f26a2e",
        lagoon: "#0d9488",
        sand: "#f4dfb9",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.16)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(13, 148, 136, 0.20), transparent 38%), radial-gradient(circle at 80% 0%, rgba(242, 106, 46, 0.18), transparent 28%), linear-gradient(135deg, #f6f1e7 0%, #edf4f2 55%, #f7ede1 100%)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

