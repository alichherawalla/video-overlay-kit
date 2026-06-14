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

const ICON_SIZE = 132;
const ICON_BOX = 180;
const LABEL_FONT = 44;
const ARROW_STROKE = 5;
const NODE_REVEAL_FRAMES = 10;
const ARROW_DRAW_FRAMES = 14;
const ARROW_HEAD = 22;

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
    const CONTAINER_W = 800;
    const SLOT_H = 260;
    const NODE_LABEL_GAP = 16;
    const LABEL_HEIGHT = 58;
    const CONTAINER_H = SLOT_H * n;
    const arrowGap = ICON_BOX / 2 + 14;

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

            const cx = CONTAINER_W / 2;
            const y1 = SLOT_H * (i + 0.5) + arrowGap;
            const y2 = SLOT_H * (i + 1.5) - arrowGap - ARROW_HEAD;
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
                    points={`${cx},${y2 + ARROW_HEAD} ${cx - ARROW_HEAD * 0.6},${y2} ${cx + ARROW_HEAD * 0.6},${y2}`}
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
          const cy = SLOT_H * (i + 0.5);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (CONTAINER_W - ICON_BOX) / 2,
                top: cy - ICON_BOX / 2,
                width: ICON_BOX,
                opacity: p,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: NODE_LABEL_GAP,
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
                  position: "absolute",
                  top: ICON_BOX + 6,
                  width: CONTAINER_W,
                  left: -(CONTAINER_W - ICON_BOX) / 2,
                  fontFamily: FONT_FAMILY,
                  fontSize: LABEL_FONT,
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: 1.15,
                  height: LABEL_HEIGHT,
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
