/**
 * Safe-area reserves and auto-scale helpers used by every composite component.
 *
 * The kit's promise: a spec always renders inside the platform safe area. Title
 * doesn't get clipped at the top, content doesn't get covered by the platform
 * caption / action overlay at the bottom. Components read the reserves below
 * and scale their natural size down if the spec would overflow.
 *
 * Portrait reserves are tuned for Instagram Reels / TikTok / YouTube Shorts,
 * which all clip the top ~12% (account bar / Reels header) and the bottom ~25%
 * (caption + action buttons + audio bar). Two-line 92pt titles fit within
 * titleReserve. Bottom caption strip clears bottomReserve.
 *
 * Landscape reserves are tuned for YouTube / desktop / LinkedIn / X, where the
 * title bar takes ~12% and the bottom is roughly clean (player chrome only).
 */

export type CanvasAspect = "portrait" | "landscape";

export const aspectOf = (width: number, height: number): CanvasAspect =>
  width > height ? "landscape" : "portrait";

export type SafeArea = {
  titleReserve: number;
  bottomMargin: number;
  /** vertical space available for content between titleReserve and bottomMargin */
  availableHeight: number;
};

export const safeAreaFor = (width: number, height: number): SafeArea => {
  const isLandscape = width > height;
  const titleReserve = isLandscape ? 240 : 500;
  const bottomMargin = isLandscape ? 100 : 570;
  return {
    titleReserve,
    bottomMargin,
    availableHeight: Math.max(200, height - titleReserve - bottomMargin),
  };
};

/**
 * Scale factor that shrinks `naturalHeight` to fit `availableHeight` without
 * going above 1. Components multiply every internal dimension (icon size, row
 * height, gap, label font, label height) by this factor when laying out.
 */
export const fitScale = (naturalHeight: number, availableHeight: number): number => {
  if (naturalHeight <= availableHeight) return 1;
  return availableHeight / naturalHeight;
};

/**
 * Predict the natural height a track's content would occupy with no scaling.
 * Used by validate_scene to warn the caller if a spec would need significant
 * shrinkage to fit the canvas.
 */
export type HeightPrediction = {
  trackId: string;
  kind: string;
  natural: number;
  available: number;
  scale: number;
  /** true when the component would have to shrink below 0.7x to fit */
  warn: boolean;
};
