import { createContext, useContext } from "react";
import type React from "react";

export type ThemeName = "light" | "dark";

export type Palette = {
  /** Canvas / page background */
  background: string;
  /** Primary text and icon stroke */
  ink: string;
  /** Secondary text (sub-labels) */
  inkMuted: string;
  /** Tertiary text (hints, meta) */
  inkDim: string;
  /** Lavender, used for connectors, accent bar, divider lines */
  accent: string;
  /** Deeper lavender, reserved for pressed states and ribbons */
  accentDeep: string;
  /** Hairline border */
  hairline: string;
  /** Radial ambient bloom rendered behind tracks (CSS gradient string) */
  bloom: string;
  /** Linear sunset gradient for accent-word title text (CSS gradient string) */
  sunset: string;
};

/**
 * Palette derived from Wednesday Solutions design system (docs/design.md).
 * Light is the default; dark is supported by setting `theme: "dark"` on the scene spec.
 */
export const themes: Record<ThemeName, Palette> = {
  light: {
    background: "#FAFAF7",
    ink: "#0B0B0D",
    inkMuted: "#3A3A3A",
    inkDim: "#6B6B6B",
    accent: "#DC2626",
    accentDeep: "#B91C1C",
    hairline: "#E5E5E0",
    bloom: "none",
    sunset: "linear-gradient(135deg, #0B0B0D 0%, #0B0B0D 100%)",
  },
  dark: {
    background: "#0B0B0D",
    ink: "#FAFAF7",
    inkMuted: "#C7C7C7",
    inkDim: "#8A8A8A",
    accent: "#EF4444",
    accentDeep: "#DC2626",
    hairline: "#2A2A2A",
    bloom: "none",
    sunset: "linear-gradient(135deg, #FAFAF7 0%, #FAFAF7 100%)",
  },
};

/**
 * Wednesday brand font stack. Aeonik is proprietary; if you have a license,
 * drop the files into `public/fonts/aeonik/`. Otherwise the stack falls back
 * to the system sans-serif (San Francisco on macOS, etc).
 */
export const FONT_FAMILY = '"Aeonik", ui-sans-serif, system-ui, -apple-system, sans-serif';

/**
 * Stable id used in url(#...) references on SVG icons so they paint with the
 * sunset gradient. The gradient itself is rendered once in Scene.tsx as a
 * hidden <svg><defs>.
 */
export const ACCENT_GRADIENT_ID = "vok-accent-gradient";

/**
 * The same sunset gradient defined as discrete stops, so it can be rendered
 * as both a CSS linear-gradient (for background-clip text) and an SVG
 * <linearGradient> (for icon strokes). Order matches the visual direction
 * (top-left to bottom-right).
 */
export const sunsetStops: Record<ThemeName, Array<{ offset: number; color: string }>> = {
  light: [
    { offset: 0, color: "#0B0B0D" },
    { offset: 1, color: "#0B0B0D" },
  ],
  dark: [
    { offset: 0, color: "#FAFAF7" },
    { offset: 1, color: "#FAFAF7" },
  ],
};

export const gradientTextStyle = (gradientCss: string): React.CSSProperties => ({
  backgroundImage: gradientCss,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
});

export const accentStrokeUrl = `url(#${ACCENT_GRADIENT_ID})`;

export const PaletteContext = createContext<Palette>(themes.light);
export const usePalette = () => useContext(PaletteContext);
