import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Stadium-night palette
        pitch: {
          950: "#070B10",
          900: "#0A0F16",
          850: "#0E141D",
          800: "#131B26",
          700: "#1B2532",
          600: "#26333F",
        },
        // Electric turf — primary energy accent
        turf: {
          DEFAULT: "#3DFF7A",
          bright: "#5BFF8F",
          dim: "#1FA855",
        },
        // Champion gold
        gold: {
          DEFAULT: "#FFCB47",
          deep: "#E0A500",
        },
        chalk: "#EAF1F5",
        muted: "#8A99A8",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        goalflash: {
          "0%": { backgroundColor: "rgba(61,255,122,0.0)" },
          "30%": { backgroundColor: "rgba(61,255,122,0.28)" },
          "100%": { backgroundColor: "rgba(61,255,122,0.0)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        goalflash: "goalflash 1.6s ease-out",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
