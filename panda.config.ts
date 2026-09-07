import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  shorthands: false,
  presets: ["@pandacss/preset-base"],
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  globalCss: {
    ":root": {
      fontFamily:
        '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#202833",
      background: "#f3f5f8",
      fontSynthesis: "none",
      WebkitFontSmoothing: "antialiased",
    },
    "*": { boxSizing: "border-box" },
    body: { margin: "0" },
    "button, input": { font: "inherit" },
    button: { cursor: "pointer", WebkitTapHighlightColor: "transparent" },
    "button:focus-visible, input:focus-visible": {
      outline: "2px solid #299adb",
      outlineOffset: "3px",
    },
  },
  theme: {
    extend: {
      keyframes: {
        "toast-in": {
          from: { opacity: 0, transform: "translateY(5px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
});
