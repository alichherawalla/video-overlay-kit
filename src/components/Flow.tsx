import * as TablerIcons from "@tabler/icons-react";
import type { FlowTrack } from "../scene/types";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY, accentStrokeUrl, gradientTextStyle } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const ICON_SIZE = 200;
const ICON_BOX = 260;
const LABEL_FONT = 56;
const LABEL_HEIGHT = 76;
const LABEL_GAP_FROM_ICON = 10;
const ARROW_STROKE = 6;
const ARROW_HEAD = 26;
const NODE_REVEAL_FRAMES = 10;
const ARROW_DRAW_FRAMES = 14;

export const Flow: React.FC<{ track: FlowTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const config = useVideoConfig();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const n = track.nodes.length;
  const cadence = track.revealCadenceFrames;

  const direction =
    track.direction === "auto" || !track.direction
      ? config.height > config.width
        ? "vertical"
        : "horizontal"
      : track.direction;

  if (direction === "vertical") {
    const CONTAINER_W = 880;
    const SLOT_H = 460;
    const ARROW_MARGIN = 18;
    const CONTAINER_H = SLOT_H * n;
    const cx = CONTAINER_W / 2;

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
        }}
      >
        <svg
          width={CONTAINER_W}
          height={CONTAINER_H}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {track.nodes.slice(0, -1).map((_, i) => {
            const arrowStartFrame = track.startFrame + cadence * (i + 0.5);
            const p = phaseProgress(frame, arrowStartFrame, ARROW_DRAW_FRAMES, "easeOut");
            if (p === 0) return null;

            const slotCenterI = SLOT_H * (i + 0.5);
            const slotCenterI1 = SLOT_H * (i + 1.5);
            const y1 = slotCenterI + ICON_BOX / 2 + LABEL_GAP_FROM_ICON + LABEL_HEIGHT + ARROW_MARGIN;
            const y2 = slotCenterI1 - ICON_BOX / 2 - ARROW_MARGIN - ARROW_HEAD;
            const totalLen = y2 - y1;
            const drawLen = totalLen * p;

            return (
              <g key={`arrow-${i}`}>
                <line
                  x1={cx}
                  y1={y1}
                  x2={cx}
                  y2={y1 + drawLen}
                  stroke={palette.accent}
                  strokeWidth={ARROW_STROKE}
                  strokeLinecap="round"
                />
                {p >= 0.95 ? (
                  <polygon
                    points={`${cx},${y2 + ARROW_HEAD} ${cx - ARROW_HEAD * 0.55},${y2} ${cx + ARROW_HEAD * 0.55},${y2}`}
                    fill={palette.accent}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {track.nodes.map((node, i) => {
          const Icon = lookup[node.iconName];
          const nodeFrame = track.startFrame + cadence * i;
          const p = phaseProgress(frame, nodeFrame, NODE_REVEAL_FRAMES, "easeOut");
          const scale = 0.85 + 0.15 * p;
          const slotCenter = SLOT_H * (i + 0.5);
          const iconTop = slotCenter - ICON_BOX / 2;
          const labelTop = slotCenter + ICON_BOX / 2 + LABEL_GAP_FROM_ICON;

          return (
            <div key={i} style={{ opacity: p, transform: `scale(${scale})`, transformOrigin: `${cx}px ${slotCenter}px` }}>
              <div
                style={{
                  position: "absolute",
                  left: cx - ICON_BOX / 2,
                  top: iconTop,
                  width: ICON_BOX,
                  height: ICON_BOX,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Icon ? (
                  <Icon size={ICON_SIZE} color={accentStrokeUrl} stroke={2.4} />
                ) : (
                  <div style={{ color: "red", fontFamily: "monospace", fontSize: 14, textAlign: "center" }}>
                    missing icon: {node.iconName}
                  </div>
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: labelTop,
                  width: CONTAINER_W,
                  height: LABEL_HEIGHT,
                  fontFamily: FONT_FAMILY,
                  fontSize: LABEL_FONT,
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  ...gradientTextStyle(palette.sunset),
                }}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const CONTAINER_W_H = 1000;
  const slotWidth = CONTAINER_W_H / n;
  const arrowGap = ICON_BOX / 2 + 16;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: CONTAINER_W_H,
        height: ICON_BOX + LABEL_FONT * 2.2,
      }}
    >
      <svg
        width={CONTAINER_W_H}
        height={ICON_BOX}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {track.nodes.slice(0, -1).map((_, i) => {
          const arrowStartFrame = track.startFrame + cadence * (i + 0.5);
          const p = phaseProgress(frame, arrowStartFrame, ARROW_DRAW_FRAMES, "easeOut");
          if (p === 0) return null;

          const x1 = slotWidth * (i + 0.5) + arrowGap;
          const x2 = slotWidth * (i + 1.5) - arrowGap;
          const cy = ICON_BOX / 2;
          const totalLen = x2 - x1;
          const drawLen = totalLen * p;

          return (
            <g key={`arrow-${i}`}>
              <line
                x1={x1}
                y1={cy}
                x2={x1 + drawLen}
                y2={cy}
                stroke={palette.accent}
                strokeWidth={ARROW_STROKE}
                strokeLinecap="round"
              />
              {p >= 0.95 ? (
                <polygon
                  points={`${x2},${cy} ${x2 - ARROW_HEAD},${cy - ARROW_HEAD * 0.6} ${x2 - ARROW_HEAD},${cy + ARROW_HEAD * 0.6}`}
                  fill={palette.accent}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {track.nodes.map((node, i) => {
        const Icon = lookup[node.iconName];
        const nodeFrame = track.startFrame + cadence * i;
        const p = phaseProgress(frame, nodeFrame, NODE_REVEAL_FRAMES, "easeOut");
        const scale = 0.85 + 0.15 * p;
        const cx = slotWidth * (i + 0.5);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - ICON_BOX / 2,
              top: 0,
              width: ICON_BOX,
              opacity: p,
              transform: `scale(${scale})`,
              transformOrigin: "center top",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: ICON_BOX,
                height: ICON_BOX,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icon ? (
                <Icon size={ICON_SIZE} color={accentStrokeUrl} stroke={2.4} />
              ) : (
                <div style={{ color: "red", fontFamily: "monospace", fontSize: 14, textAlign: "center" }}>
                  missing icon: {node.iconName}
                </div>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: LABEL_FONT,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: ICON_BOX + 60,
                letterSpacing: "-0.01em",
                ...gradientTextStyle(palette.sunset),
              }}
            >
              {node.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
