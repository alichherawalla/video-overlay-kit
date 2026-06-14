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
    background: "#F0EDF8",
    ink: "#0B0B0D",
    inkMuted: "#3A3A4A",
    inkDim: "#6B6B7E",
    accent: "#7A5BDC",
    accentDeep: "#5A3DB8",
    hairline: "#CCCAE0",
    bloom:
      "radial-gradient(ellipse 80% 60% at 50% 28%, rgba(122,91,220,0.22) 0%, rgba(177,83,211,0.08) 38%, rgba(122,91,220,0.04) 65%, transparent 90%)",
    sunset:
      "linear-gradient(135deg, #DE7BAD 0%, #B153D3 28%, #A485F5 58%, #7A5BDC 82%, #5A3DB8 100%)",
  },
  dark: {
    background: "#0B0B0D",
    ink: "#FFFFFF",
    inkMuted: "#C7C7CE",
    inkDim: "#8A8A92",
    accent: "#9B74F2",
    accentDeep: "#7A5BDC",
    hairline: "#26262A",
    bloom:
      "radial-gradient(ellipse 80% 60% at 50% 28%, rgba(164,133,245,0.26) 0%, rgba(177,83,211,0.10) 40%, transparent 82%)",
    sunset:
      "linear-gradient(135deg, #DE7BAD 0%, #C9ADFE 32%, #A485F5 65%, #7A5BDC 100%)",
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
    { offset: 0, color: "#DE7BAD" },
    { offset: 0.28, color: "#B153D3" },
    { offset: 0.58, color: "#A485F5" },
    { offset: 0.82, color: "#7A5BDC" },
    { offset: 1, color: "#5A3DB8" },
  ],
  dark: [
    { offset: 0, color: "#DE7BAD" },
    { offset: 0.32, color: "#C9ADFE" },
    { offset: 0.65, color: "#A485F5" },
    { offset: 1, color: "#7A5BDC" },
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
