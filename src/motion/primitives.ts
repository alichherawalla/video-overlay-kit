import { interpolate, Easing } from "remotion";

type EaseKind = "linear" | "easeIn" | "easeOut" | "easeInOut";

const easingFn = (kind: EaseKind) => {
  switch (kind) {
    case "linear":
      return Easing.linear;
    case "easeIn":
      return Easing.in(Easing.cubic);
    case "easeOut":
      return Easing.out(Easing.cubic);
    case "easeInOut":
      return Easing.inOut(Easing.cubic);
  }
};

export const phaseProgress = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  ease: EaseKind = "easeOut",
): number => {
  if (durationFrames <= 0) return frame >= startFrame ? 1 : 0;
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFn(ease),
  });
};

export type EnterExitKind =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "none";

export const trackStyle = (
  frame: number,
  startFrame: number,
  endFrame: number,
  enter: { kind: EnterExitKind; durationFrames: number; ease: EaseKind },
  exit: { kind: EnterExitKind; durationFrames: number; ease: EaseKind },
): { opacity: number; transform: string; visible: boolean } => {
  const visible = frame >= startFrame && frame <= endFrame;
  if (!visible) return { opacity: 0, transform: "translate3d(0,0,0)", visible: false };

  const enterP = phaseProgress(frame, startFrame, enter.durationFrames, enter.ease);
  const exitStart = endFrame - exit.durationFrames;
  const exitP = phaseProgress(frame, exitStart, exit.durationFrames, exit.ease);
  const exitFactor = exit.kind === "none" ? 0 : exitP;

  const opacityIn = enter.kind === "fade" ? enterP : 1 * (enter.kind === "none" ? 1 : enterP);
  const opacityOut = exit.kind === "fade" || exit.kind === "scale" ? 1 - exitFactor : 1;
  const opacity = Math.min(opacityIn, opacityOut);

  const slidePx = 80;
  let tx = 0;
  let ty = 0;
  let scale = 1;

  switch (enter.kind) {
    case "slide-up":
      ty = (1 - enterP) * slidePx;
      break;
    case "slide-down":
      ty = (1 - enterP) * -slidePx;
      break;
    case "slide-left":
      tx = (1 - enterP) * slidePx;
      break;
    case "slide-right":
      tx = (1 - enterP) * -slidePx;
      break;
    case "scale":
      scale = 0.85 + 0.15 * enterP;
      break;
  }

  if (exitFactor > 0) {
    switch (exit.kind) {
      case "slide-up":
        ty -= exitFactor * slidePx;
        break;
      case "slide-down":
        ty += exitFactor * slidePx;
        break;
      case "slide-left":
        tx -= exitFactor * slidePx;
        break;
      case "slide-right":
        tx += exitFactor * slidePx;
        break;
      case "scale":
        scale *= 1 - 0.15 * exitFactor;
        break;
    }
  }

  return {
    opacity,
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
    visible: true,
  };
};
