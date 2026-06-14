import * as TablerIcons from "@tabler/icons-react";
import type { ComparisonTrack } from "../scene/types";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY, accentStrokeUrl, gradientTextStyle } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const ICON_SIZE = 200;
const LABEL_FONT = 64;
const SUBLABEL_FONT = 38;
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
          gap: 22,
          opacity: progress,
          transform: `translate(${(1 - progress) * enterOffset.tx}px, ${(1 - progress) * enterOffset.ty}px)`,
        }}
      >
        <div
          style={{
            width: ICON_SIZE + 28,
            height: ICON_SIZE + 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icon ? (
            <Icon size={ICON_SIZE} color={accentStrokeUrl} stroke={2.4} />
          ) : (
            <div style={{ color: "red", fontFamily: "monospace", fontSize: 14 }}>missing: {side.iconName}</div>
          )}
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: LABEL_FONT,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.12,
            maxWidth: width - 40,
            letterSpacing: "-0.02em",
            ...gradientTextStyle(palette.sunset),
          }}
        >
          {side.label}
        </div>
        {side.subLabel ? (
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: SUBLABEL_FONT,
              fontWeight: 500,
              color: palette.accentDeep,
              textAlign: "center",
              lineHeight: 1.22,
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
    const CONTAINER_W = 940;
    const SIDE_H = 520;
    const DIVIDER_H = 180;
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
                  height: 5,
                  width: 420,
                  background: palette.accent,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: 2.5,
                }}
              />
            ) : null}
            <div
              style={{
                position: "relative",
                background: palette.background,
                padding: "12px 32px",
                fontFamily: FONT_FAMILY,
                fontSize: 64,
                fontWeight: 700,
                color: palette.accent,
                textTransform: "lowercase",
                letterSpacing: "-0.02em",
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

  const CONTAINER_W = Math.min(1600, Math.round(config.width * 0.86));
  const SIDE_H = 420;
  const DIVIDER_W = 180;
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
        <div style={{ position: "relative", width: DIVIDER_W, height: SIDE_H, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {track.divider.showLine ? (
            <div
              style={{
                position: "absolute",
                width: 5,
                height: Math.round(SIDE_H * 0.85),
                background: palette.accent,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: 2.5,
              }}
            />
          ) : null}
          <div
            style={{
              position: "relative",
              background: palette.background,
              padding: "16px 26px",
              fontFamily: FONT_FAMILY,
              fontSize: 64,
              fontWeight: 700,
              color: palette.accent,
              textTransform: "lowercase",
              letterSpacing: "-0.02em",
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
