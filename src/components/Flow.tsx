import * as TablerIcons from "@tabler/icons-react";
import type { FlowTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const CONTAINER_WIDTH = 1000;
const ICON_SIZE = 96;
const ICON_BOX = 140;
const LABEL_FONT = 32;
const ARROW_STROKE = 4;
const NODE_REVEAL_FRAMES = 10;
const ARROW_DRAW_FRAMES = 14;

export const Flow: React.FC<{ track: FlowTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const n = track.nodes.length;
  const slotWidth = CONTAINER_WIDTH / n;
  const cadence = track.revealCadenceFrames;
  const arrowGap = ICON_BOX / 2 + 16;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: CONTAINER_WIDTH,
        height: ICON_BOX + LABEL_FONT * 2.2,
      }}
    >
      <svg
        width={CONTAINER_WIDTH}
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
          const arrowHeadSize = 16;

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
                  points={`${x2},${cy} ${x2 - arrowHeadSize},${cy - arrowHeadSize * 0.6} ${x2 - arrowHeadSize},${cy + arrowHeadSize * 0.6}`}
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
                <Icon size={ICON_SIZE} color={palette.ink} stroke={2} />
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
                fontWeight: 600,
                color: palette.ink,
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: ICON_BOX + 40,
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
