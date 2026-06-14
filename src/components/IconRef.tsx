import * as TablerIcons from "@tabler/icons-react";
import type { IconTrack } from "../scene/types";
import { useCurrentFrame } from "remotion";
import { trackStyle } from "../motion/primitives";
import { usePalette } from "../scene/theme";

type TablerIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  stroke?: number;
}>;

export const IconRef: React.FC<{ track: IconTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const style = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  if (!style.visible) return null;

  const color = track.color ?? palette.ink;
  const lookup = TablerIcons as unknown as Record<string, TablerIconComponent>;
  const Icon = lookup[track.name];

  if (!Icon) {
    return (
      <div
        style={{
          position: "absolute",
          left: `${track.position.x * 100}%`,
          top: `${track.position.y * 100}%`,
          transform: `translate(-50%, -50%) ${style.transform}`,
          opacity: style.opacity,
          color: "red",
          fontSize: 24,
          fontFamily: "monospace",
        }}
      >
        missing icon: {track.name}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${style.transform}`,
        opacity: style.opacity,
        color,
        display: "flex",
      }}
    >
      <Icon size={track.sizePx} color={color} stroke={track.strokeWidth} />
    </div>
  );
};
