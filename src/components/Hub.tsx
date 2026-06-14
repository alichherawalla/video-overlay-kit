import * as TablerIcons from "@tabler/icons-react";
import type { HubTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const CONTAINER = 900;
const CENTER_ICON = 140;
const SAT_ICON = 88;
const SAT_LABEL = 26;
const RADIUS = 290;
const LINE_DRAW_FRAMES = 12;
const NODE_REVEAL_FRAMES = 10;

const satelliteAngle = (i: number, n: number): number => {
  return (2 * Math.PI * i) / n - Math.PI / 2;
};

export const Hub: React.FC<{ track: HubTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const cx = CONTAINER / 2;
  const cy = CONTAINER / 2;
  const cadence = track.revealCadenceFrames;
  const CenterIcon = lookup[track.center.iconName];

  const centerP = phaseProgress(frame, track.startFrame, NODE_REVEAL_FRAMES, "easeOut");

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${containerStyle.transform}`,
        opacity: containerStyle.opacity,
        width: CONTAINER,
        height: CONTAINER,
      }}
    >
      <svg
        width={CONTAINER}
        height={CONTAINER}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {track.satellites.map((_, i) => {
          const angle = satelliteAngle(i, track.satellites.length);
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);
          const CENTER_LABEL_CLEARANCE = 64;
          const SAT_LABEL_CLEARANCE = 50;
          const innerR =
            dy > 0.15 ? CENTER_ICON / 2 + CENTER_LABEL_CLEARANCE : CENTER_ICON / 2 + 16;
          const outerR =
            dy < -0.15 ? SAT_ICON / 2 + SAT_LABEL_CLEARANCE : SAT_ICON / 2 + 16;
          const sx = cx + dx * innerR;
          const sy = cy + dy * innerR;
          const ix = cx + dx * (RADIUS - outerR);
          const iy = cy + dy * (RADIUS - outerR);

          const lineStartFrame = track.startFrame + cadence * (i + 0.4);
          const lp = phaseProgress(frame, lineStartFrame, LINE_DRAW_FRAMES, "easeOut");
          if (lp === 0) return null;

          const ldx = ix - sx;
          const ldy = iy - sy;
          return (
            <line
              key={`line-${i}`}
              x1={sx}
              y1={sy}
              x2={sx + ldx * lp}
              y2={sy + ldy * lp}
              stroke={palette.accent}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: cx - CENTER_ICON / 2,
          top: cy - CENTER_ICON / 2,
          width: CENTER_ICON,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: centerP,
          transform: `scale(${0.85 + 0.15 * centerP})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            width: CENTER_ICON,
            height: CENTER_ICON,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: palette.background,
            borderRadius: "50%",
          }}
        >
          {CenterIcon ? (
            <CenterIcon size={CENTER_ICON - 28} color={palette.ink} stroke={2.2} />
          ) : (
            <div style={{ color: "red", fontFamily: "monospace", fontSize: 14 }}>missing: {track.center.iconName}</div>
          )}
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 700,
            color: palette.ink,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {track.center.label}
        </div>
      </div>

      {track.satellites.map((sat, i) => {
        const angle = satelliteAngle(i, track.satellites.length);
        const ex = cx + Math.cos(angle) * RADIUS;
        const ey = cy + Math.sin(angle) * RADIUS;
        const nodeStartFrame = track.startFrame + cadence * (i + 1);
        const p = phaseProgress(frame, nodeStartFrame, NODE_REVEAL_FRAMES, "easeOut");
        if (p === 0) return null;
        const Icon = lookup[sat.iconName];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ex - SAT_ICON / 2,
              top: ey - SAT_ICON / 2,
              width: SAT_ICON,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: p,
              transform: `scale(${0.85 + 0.15 * p})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                width: SAT_ICON,
                height: SAT_ICON,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: palette.background,
                borderRadius: "50%",
              }}
            >
              {Icon ? (
                <Icon size={SAT_ICON - 20} color={palette.ink} stroke={2} />
              ) : (
                <div style={{ color: "red", fontFamily: "monospace", fontSize: 12 }}>missing: {sat.iconName}</div>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: SAT_LABEL,
                fontWeight: 600,
                color: palette.ink,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {sat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
