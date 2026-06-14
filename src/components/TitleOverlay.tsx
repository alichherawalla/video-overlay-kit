import type { TitleOverlayTrack } from "../scene/types";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { trackStyle } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

export const TitleOverlay: React.FC<{ track: TitleOverlayTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const config = useVideoConfig();
  const isLandscape = config.width > config.height;
  const titleSize = isLandscape ? 96 : 76;
  const maxWidth = isLandscape ? 1700 : 980;
  const titleTop = isLandscape ? 48 : 120;
  const enter = { ...track.enter, kind: track.enter.kind === "fade" ? ("slide-down" as const) : track.enter.kind };
  const style = trackStyle(frame, track.startFrame, track.endFrame, enter, track.exit);
  if (!style.visible) return null;

  const useGradient = track.useGradient ?? false;

  const textStyle: React.CSSProperties = useGradient
    ? {
        backgroundImage: palette.sunset,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }
    : { color: palette.ink };

  return (
    <div
      style={{
        position: "absolute",
        top: titleTop,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        transform: style.transform,
        opacity: style.opacity,
      }}
    >
      <div
        style={{
          padding: "0 60px",
          maxWidth,
          fontSize: titleSize,
          fontWeight: 800,
          fontFamily: FONT_FAMILY,
          textAlign: "center",
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          ...textStyle,
        }}
      >
        {track.text}
      </div>
    </div>
  );
};
