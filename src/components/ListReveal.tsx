import * as TablerIcons from "@tabler/icons-react";
import type { ListRevealTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const ROW_HEIGHT = 160;
const ROW_GAP = 36;
const REVEAL_DURATION = 10;

export const ListReveal: React.FC<{ track: ListRevealTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const totalHeight = track.rows.length * ROW_HEIGHT + (track.rows.length - 1) * ROW_GAP;
  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: 960,
        height: totalHeight,
        display: "flex",
        flexDirection: "column",
        gap: ROW_GAP,
      }}
    >
      {track.rows.map((row, i) => {
        const rowFrame = track.startFrame + row.revealAtFrame;
        const p = phaseProgress(frame, rowFrame, REVEAL_DURATION, "easeOut");
        const ty = (1 - p) * 24;
        const Icon = row.iconName ? lookup[row.iconName] : null;
        return (
          <div
            key={i}
            style={{
              height: ROW_HEIGHT,
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "0 12px",
              opacity: p,
              transform: `translateY(${ty}px)`,
            }}
          >
            {Icon ? (
              <div style={{ display: "flex", flexShrink: 0 }}>
                <Icon size={88} color={palette.ink} stroke={2} />
              </div>
            ) : null}
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 52,
                fontWeight: 500,
                color: palette.ink,
                lineHeight: 1.25,
              }}
            >
              {row.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
