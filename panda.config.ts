import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  shorthands: false,
  presets: ["@pandacss/preset-base"],
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--page-bg": "#f3f5f8",
      "--text-color": "#202833",
      "--surface": "white",
      "--surface-subtle": "#fafbfd",
      "--border-color": "#e3e8ee",
      "--separator-color": "#edf0f4",
      "--row-separator-color": "#f0f2f5",
      "--reveal-color": "243, 245, 248",
      "--control-bg": "#f2f4f7",
      "--count-bg": "#edf0f3",
      "--count-active-bg": "#e5f3fb",
      fontFamily:
        '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "var(--text-color)",
      background: "var(--page-bg)",
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
    "@media (prefers-color-scheme: dark)": {
      ":root": {
        "--page-bg": "#151a20",
        "--text-color": "#edf1f5",
        "--surface": "#202731",
        "--surface-subtle": "#1b222b",
        "--border-color": "#303a46",
        "--separator-color": "#2b3540",
        "--row-separator-color": "#303943",
        "--reveal-color": "34, 42, 52",
        "--control-bg": "#2a333e",
        "--count-bg": "#303a46",
        "--count-active-bg": "#244c66",
      },
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
