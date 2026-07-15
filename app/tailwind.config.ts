import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Stadium-night base
        pitch: {
          950: "#060910",
          900: "#0A0F1A",
          850: "#0E141F",
          800: "#131B29",
          700: "#1C2637",
          600: "#28344A",
        },
        // Brand spectrum — a coherent gradient family (green → aqua → blue → violet → magenta)
        turf: { DEFAULT: "#3DFF7A", bright: "#5DFF93", dim: "#1FA855" },
        aqua: "#22E3C3",
        azure: "#4C8DFF",
        iris: "#9B6BFF",
        magenta: "#FF5DA2",
        // Champion gold
        gold: { DEFAULT: "#FFCB47", deep: "#E0A500" },
        chalk: "#EEF3F8",
        muted: "#97A6B8", // lightened for AA contrast on dark surfaces
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "var(--radius)",
        control: "var(--radius-sm)",
      },
      keyframes: {
        goalflash: {
          "0%": { backgroundColor: "rgba(61,255,122,0.0)" },
          "30%": { backgroundColor: "rgba(61,255,122,0.28)" },
          "100%": { backgroundColor: "rgba(61,255,122,0.0)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%,-4%,0) scale(1.12)" },
        },
        driftAlt: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-7%,5%,0) scale(0.95)" },
        },
        sheen: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        goalflash: "goalflash 1.6s ease-out",
        drift: "drift 18s ease-in-out infinite",
        driftAlt: "driftAlt 22s ease-in-out infinite",
        sheen: "sheen 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
