import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta derivada do logo - tons para acentos
        amopark: {
          red: "#E53935",
          orange: "#FF9800",
          purple: "#7B1FA2",
          blue: "#1976D2",
          green: "#43A047",
          yellow: "#FDD835",
          charcoal: "#37474F",
          "gray-light": "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
