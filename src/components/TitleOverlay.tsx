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
          color: palette.ink,
          fontSize: 80,
          fontWeight: 700,
          fontFamily: FONT_FAMILY,
          textAlign: "center",
          lineHeight: 1.12,
          letterSpacing: "-0.015em",
        }}
      >
        {track.text}
      </div>
      <div
        style={{
          width: 160,
          height: 4,
          background: palette.accent,
          borderRadius: 2,
        }}
      />
    </div>
  );
};
