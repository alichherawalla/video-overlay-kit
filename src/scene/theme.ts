import { createContext, useContext } from "react";

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
  /** Lavender — connectors, accent bar, divider lines */
  accent: string;
  /** Deeper lavender — pressed, ribbons (reserved) */
  accentDeep: string;
  /** Hairline border */
  hairline: string;
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
  },
  dark: {
    background: "#0B0B0D",
    ink: "#FFFFFF",
    inkMuted: "#C7C7CE",
    inkDim: "#8A8A92",
    accent: "#9B74F2",
    accentDeep: "#7A5BDC",
    hairline: "#26262A",
  },
};

/**
 * Wednesday brand font stack. Aeonik is proprietary; if you have a license,
 * drop the files into `public/fonts/aeonik/`. Otherwise the stack falls back
 * to the system sans-serif (San Francisco on macOS, etc).
 */
export const FONT_FAMILY = '"Aeonik", ui-sans-serif, system-ui, -apple-system, sans-serif';

export const PaletteContext = createContext<Palette>(themes.light);
export const usePalette = () => useContext(PaletteContext);
