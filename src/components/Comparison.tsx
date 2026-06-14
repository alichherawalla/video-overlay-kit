import * as TablerIcons from "@tabler/icons-react";
import type { ComparisonTrack } from "../scene/types";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const ICON_SIZE = 140;
const LABEL_FONT = 48;
const SUBLABEL_FONT = 30;
const REVEAL_FRAMES = 12;

export const Comparison: React.FC<{ track: ComparisonTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const config = useVideoConfig();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const cadence = track.revealCadenceFrames;

  const leftP = phaseProgress(frame, track.startFrame, REVEAL_FRAMES, "easeOut");
  const rightP = phaseProgress(frame, track.startFrame + cadence, REVEAL_FRAMES, "easeOut");
  const dividerP = phaseProgress(frame, track.startFrame + cadence * 2, REVEAL_FRAMES, "easeOut");

  const direction =
    track.direction === "auto" || !track.direction
      ? config.height > config.width
        ? "vertical"
        : "horizontal"
      : track.direction;

  const renderSide = (
    side: ComparisonTrack["left"],
    progress: number,
    width: number,
    enterOffset: { tx: number; ty: number },
  ) => {
    const Icon = lookup[side.iconName];
    return (
      <div
        style={{
          width,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 20,
          opacity: progress,
          transform: `translate(${(1 - progress) * enterOffset.tx}px, ${(1 - progress) * enterOffset.ty}px)`,
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
            maxWidth: width - 40,
            letterSpacing: "-0.01em",
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
              maxWidth: width - 40,
            }}
          >
            {side.subLabel}
          </div>
        ) : null}
      </div>
    );
  };

  if (direction === "vertical") {
    const CONTAINER_W = 880;
    const SIDE_H = 380;
    const DIVIDER_H = 140;
    const CONTAINER_H = SIDE_H * 2 + DIVIDER_H;

    return (
      <div
        style={{
          position: "absolute",
          left: `${track.position.x * 100}%`,
          top: `${track.position.y * 100}%`,
          transform: `translate(-50%, -50%) ${containerStyle.transform}`,
          opacity: containerStyle.opacity,
          width: CONTAINER_W,
          height: CONTAINER_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ height: SIDE_H, display: "flex", alignItems: "flex-start" }}>
          {renderSide(track.left, leftP, CONTAINER_W, { tx: 0, ty: -40 })}
        </div>
        <div
          style={{
            height: DIVIDER_H,
            width: CONTAINER_W,
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
                  height: 4,
                  width: 360,
                  background: palette.accent,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: 2,
                }}
              />
            ) : null}
            <div
              style={{
                position: "relative",
                background: palette.background,
                padding: "10px 28px",
                fontFamily: FONT_FAMILY,
                fontSize: 56,
                fontWeight: 700,
                color: palette.ink,
                textTransform: "lowercase",
                letterSpacing: "-0.01em",
              }}
            >
              {track.divider.label}
            </div>
          </div>
        </div>
        <div style={{ height: SIDE_H, display: "flex", alignItems: "flex-start" }}>
          {renderSide(track.right, rightP, CONTAINER_W, { tx: 0, ty: 40 })}
        </div>
      </div>
    );
  }

  const CONTAINER_W = 1000;
  const SIDE_H = 320;
  const DIVIDER_W = 120;
  const sideWidth = (CONTAINER_W - DIVIDER_W) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: CONTAINER_W,
        height: SIDE_H,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      {renderSide(track.left, leftP, sideWidth, { tx: -40, ty: 0 })}
      <div
        style={{
          width: DIVIDER_W,
          height: SIDE_H,
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
                width: 4,
                height: 280,
                background: palette.accent,
                top: -140,
                left: "50%",
                transform: "translateX(-50%)",
                borderRadius: 2,
              }}
            />
          ) : null}
          <div
            style={{
              position: "relative",
              background: palette.background,
              padding: "14px 22px",
              fontFamily: FONT_FAMILY,
              fontSize: 56,
              fontWeight: 700,
              color: palette.ink,
              textTransform: "lowercase",
              letterSpacing: "-0.01em",
            }}
          >
            {track.divider.label}
          </div>
        </div>
      </div>
      {renderSide(track.right, rightP, sideWidth, { tx: 40, ty: 0 })}
    </div>
  );
};
