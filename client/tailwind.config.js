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
        ink: "#0b2343",
        mist: "#eef5ff",
        accent: "#2871d9",
        lagoon: "#0f5fc6",
        sand: "#dce9ff",
      },
      boxShadow: {
        glow: "0 18px 46px rgba(11, 35, 67, 0.18)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 20% 15%, rgba(40, 113, 217, 0.2), transparent 35%), radial-gradient(circle at 85% 0%, rgba(15, 95, 198, 0.16), transparent 30%), linear-gradient(145deg, #f7fbff 0%, #edf5ff 54%, #f5faff 100%)",
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
