import type { TextTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

export const TextLayer: React.FC<{ track: TextTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const style = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!style.visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${style.transform}`,
        opacity: style.opacity,
        color: track.color ?? palette.accent,
        fontSize: track.fontSizePx,
        fontWeight: track.fontWeight,
        fontFamily: track.fontFamily ?? FONT_FAMILY,
        textAlign: track.align,
        maxWidth: track.maxWidthPx,
        lineHeight: 1.2,
        whiteSpace: "pre-wrap",
      }}
    >
      {track.text}
    </div>
  );
};
