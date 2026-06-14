import { Lottie } from "@remotion/lottie";
import type { LottieTrack } from "../scene/types";
import { useCurrentFrame, delayRender, continueRender, staticFile } from "remotion";
import { trackStyle } from "../motion/primitives";
import { useEffect, useState } from "react";

const resolveSource = (src: string): string => {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return staticFile(src.replace(/^public\//, ""));
};

export const LottieRef: React.FC<{ track: LottieTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const style = trackStyle(frame, track.startFrame, track.endFrame, track.enter, track.exit);
  const [animationData, setAnimationData] = useState<unknown | null>(null);
  const [handle] = useState(() => delayRender(`lottie:${track.source}`));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const url = resolveSource(track.source);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`failed to fetch lottie ${url}: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setAnimationData(json);
      } catch (err) {
        console.error(err);
      } finally {
        continueRender(handle);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [track.source, handle]);

  if (!style.visible || !animationData) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${track.position.x * 100}%`,
        top: `${track.position.y * 100}%`,
        transform: `translate(-50%, -50%) ${style.transform}`,
        opacity: style.opacity,
        width: track.sizePx,
        height: track.sizePx,
      }}
    >
      <Lottie
        animationData={animationData as never}
        loop={track.loop}
        playbackRate={track.playbackRate}
      />
    </div>
  );
};
