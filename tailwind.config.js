/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "casino-dark": "#1a0000",
        "casino-red": "#cc0000",
        "casino-gold": "#ffd700",
        "casino-green": "#008000",
        fire: {
          100: "#fff7e6",
          300: "#ffc266",
          500: "#ff6600",
          700: "#cc3300",
        },
      },
      fontFamily: {
        bangla: ["var(--font-bangla)"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fire: {
          "0%, 100%": { color: "#ff6600", transform: "scale(1)" },
          "50%": { color: "#ffc266", transform: "scale(1.05)" },
        },
        "pulse-light": {
          "0%, 100%": {
            // Corrected: Use camelCase for 'textShadow'
            textShadow:
              "0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.7), 0 0 15px rgba(255, 0, 0, 0.7)",
          },
          "50%": {
            // Corrected: Use camelCase for 'textShadow'
            textShadow:
              "0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.9)",
          },
        },
      },
      animation: {
        fire: "fire 1.5s ease-in-out infinite",
        marquee: "marquee 20s linear infinite",
        "pulse-light": "pulse-light 3s infinite alternate",
      },
    },
  },
  plugins: [],
};
