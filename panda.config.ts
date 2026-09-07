import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  shorthands: false,
  presets: ["@pandacss/preset-base"],
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
