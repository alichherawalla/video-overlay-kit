import * as TablerIcons from "@tabler/icons-react";
import type { HubTrack } from "../scene/types";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { trackStyle, phaseProgress } from "../motion/primitives";
import { usePalette, FONT_FAMILY, accentStrokeUrl, gradientTextStyle } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

const BASE_CONTAINER = 1000;
const BASE_CENTER_ICON = 220;
const BASE_SAT_ICON = 140;
const BASE_CENTER_LABEL = 48;
const BASE_SAT_LABEL = 38;
const BASE_RADIUS = 360;
const LINE_DRAW_FRAMES = 12;
const NODE_REVEAL_FRAMES = 10;

const satelliteAngle = (i: number, n: number): number => {
  return (2 * Math.PI * i) / n - Math.PI / 2;
};

export const Hub: React.FC<{ track: HubTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const config = useVideoConfig();
  const containerStyle = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!containerStyle.visible) return null;

  // Fit the hub into the canvas with breathing room for title and IG caption band.
  const isLandscape = config.width > config.height;
  const titleReserve = isLandscape ? 240 : 500;  // portrait reserves space for a 2-line title
  const bottomMargin = isLandscape ? 100 : 570;  // portrait reserves space for IG/TikTok caption UI (~25%)
  const heightFit = config.height - titleReserve - bottomMargin;
  const widthFit = Math.round(config.width * 0.92);

  // Scale icons + labels uniformly so they don't look distorted, sized to the shorter dim.
  const SCALE = Math.min(1, heightFit / BASE_CONTAINER);
  const CENTER_ICON = Math.round(BASE_CENTER_ICON * SCALE);
  const SAT_ICON = Math.round(BASE_SAT_ICON * SCALE);
  const CENTER_LABEL = Math.max(22, Math.round(BASE_CENTER_LABEL * SCALE));
  const SAT_LABEL = Math.max(18, Math.round(BASE_SAT_LABEL * SCALE));

  // Orbit can be elliptical in landscape: wider horizontally so satellites spread
  // across the canvas instead of clustering in a centred square.
  const CONTAINER_W = isLandscape ? Math.min(widthFit, 1700) : Math.round(BASE_CONTAINER * SCALE);
  const CONTAINER_H = Math.round(BASE_CONTAINER * SCALE);
  const RADIUS_Y = Math.round(BASE_RADIUS * SCALE);
  const RADIUS_X = isLandscape
    ? Math.round((CONTAINER_W / 2) - SAT_ICON / 2 - 60)
    : RADIUS_Y;

  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const cx = CONTAINER_W / 2;
  const cy = CONTAINER_H / 2;
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
        width: CONTAINER_W,
        height: CONTAINER_H,
      }}
    >
      <svg
        width={CONTAINER_W}
        height={CONTAINER_H}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {track.satellites.map((_, i) => {
          const angle = satelliteAngle(i, track.satellites.length);
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);
          const CENTER_LABEL_CLEARANCE = Math.round(92 * SCALE);
          const SAT_LABEL_CLEARANCE = Math.round(72 * SCALE);
          const ex = cx + dx * RADIUS_X;
          const ey = cy + dy * RADIUS_Y;
          // Inner offset from centre (clear the centre icon, plus its label if going down)
          const innerVertical = dy > 0.15 ? CENTER_ICON / 2 + CENTER_LABEL_CLEARANCE : CENTER_ICON / 2 + 18;
          // Outer offset at the satellite (clear its icon, plus its label if line approaches from above)
          const outerVertical = dy < -0.15 ? SAT_ICON / 2 + SAT_LABEL_CLEARANCE : SAT_ICON / 2 + 18;
          // For nearly-horizontal lines, use icon-only clearance on both ends
          const innerOffset = Math.abs(dy) < 0.15 ? CENTER_ICON / 2 + 18 : innerVertical;
          const outerOffset = Math.abs(dy) < 0.15 ? SAT_ICON / 2 + 18 : outerVertical;
          const sx = cx + dx * innerOffset;
          const sy = cy + dy * innerOffset;
          const ix = ex - dx * outerOffset;
          const iy = ey - dy * outerOffset;

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
              strokeWidth={4}
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
          gap: 12,
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
            <CenterIcon size={CENTER_ICON - 36} color={accentStrokeUrl} stroke={2.4} />
          ) : (
            <div style={{ color: "red", fontFamily: "monospace", fontSize: 14 }}>missing: {track.center.iconName}</div>
          )}
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: CENTER_LABEL,
            fontWeight: 700,
            textAlign: "center",
            whiteSpace: "nowrap",
            letterSpacing: "-0.015em",
            ...gradientTextStyle(palette.sunset),
          }}
        >
          {track.center.label}
        </div>
      </div>

      {track.satellites.map((sat, i) => {
        const angle = satelliteAngle(i, track.satellites.length);
        const ex = cx + Math.cos(angle) * RADIUS_X;
        const ey = cy + Math.sin(angle) * RADIUS_Y;
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
              gap: 10,
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
                <Icon size={SAT_ICON - 28} color={accentStrokeUrl} stroke={2.3} />
              ) : (
                <div style={{ color: "red", fontFamily: "monospace", fontSize: 12 }}>missing: {sat.iconName}</div>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: SAT_LABEL,
                fontWeight: 700,
                textAlign: "center",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
                ...gradientTextStyle(palette.sunset),
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
