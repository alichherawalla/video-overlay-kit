import * as TablerIcons from "@tabler/icons-react";
import type { ComparisonTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const CONTAINER_WIDTH = 1000;
const SIDE_HEIGHT = 320;
const ICON_SIZE = 120;
const LABEL_FONT = 42;
const SUBLABEL_FONT = 28;
const DIVIDER_WIDTH = 120;
const REVEAL_FRAMES = 12;

export const Comparison: React.FC<{ track: ComparisonTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const cadence = track.revealCadenceFrames;
  const sideWidth = (CONTAINER_WIDTH - DIVIDER_WIDTH) / 2;

  const leftP = phaseProgress(frame, track.startFrame, REVEAL_FRAMES, "easeOut");
  const rightP = phaseProgress(frame, track.startFrame + cadence, REVEAL_FRAMES, "easeOut");
  const dividerP = phaseProgress(frame, track.startFrame + cadence * 2, REVEAL_FRAMES, "easeOut");

  const renderSide = (
    side: ComparisonTrack["left"],
    progress: number,
    enterFromLeft: boolean,
  ) => {
    const Icon = lookup[side.iconName];
    const tx = (1 - progress) * (enterFromLeft ? -40 : 40);
    return (
      <div
        style={{
          width: sideWidth,
          height: SIDE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 18,
          opacity: progress,
          transform: `translateX(${tx}px)`,
        }}
      >
        <div
          style={{
            width: ICON_SIZE + 24,
            height: ICON_SIZE + 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icon ? (
            <Icon size={ICON_SIZE} color={palette.ink} stroke={2} />
          ) : (
            <div style={{ color: "red", fontFamily: "monospace", fontSize: 14 }}>missing: {side.iconName}</div>
          )}
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: LABEL_FONT,
            fontWeight: 700,
            color: palette.ink,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: sideWidth - 40,
          }}
        >
          {side.label}
        </div>
        {side.subLabel ? (
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: SUBLABEL_FONT,
              fontWeight: 400,
              color: palette.inkDim,
              textAlign: "center",
              lineHeight: 1.25,
              maxWidth: sideWidth - 40,
            }}
          >
            {side.subLabel}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: CONTAINER_WIDTH,
        height: SIDE_HEIGHT,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      {renderSide(track.left, leftP, true)}
      <div
        style={{
          width: DIVIDER_WIDTH,
          height: SIDE_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: dividerP,
          transform: `scale(${0.85 + 0.15 * dividerP})`,
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {track.divider.showLine ? (
            <div
              style={{
                position: "absolute",
                width: 3,
                height: 180,
                background: palette.accent,
                top: -90,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          ) : null}
          <div
            style={{
              position: "relative",
              background: palette.background,
              padding: "10px 16px",
              fontFamily: FONT_FAMILY,
              fontSize: 44,
              fontWeight: 700,
              color: palette.ink,
              textTransform: "lowercase",
            }}
          >
            {track.divider.label}
          </div>
        </div>
      </div>
      {renderSide(track.right, rightP, false)}
    </div>
  );
};
