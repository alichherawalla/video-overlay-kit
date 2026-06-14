import type { TitleOverlayTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

export const TitleOverlay: React.FC<{ track: TitleOverlayTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const enter = { ...track.enter, kind: track.enter.kind === "fade" ? ("slide-down" as const) : track.enter.kind };
  const style = trackStyle(frame, track.startFrame, track.endFrame, enter, track.exit);
  if (!style.visible) return null;

  const useGradient = track.useGradient ?? true;

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
        top: 220,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        transform: style.transform,
        opacity: style.opacity,
      }}
    >
      <div
        style={{
          padding: "0 60px",
          maxWidth: 960,
          fontSize: 80,
          fontWeight: 800,
          fontFamily: FONT_FAMILY,
          textAlign: "center",
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          ...textStyle,
        }}
      >
        {track.text}
      </div>
      <div
        style={{
          width: 200,
          height: 4,
          background: palette.accent,
          borderRadius: 2,
          opacity: 0.85,
        }}
      />
    </div>
  );
};
