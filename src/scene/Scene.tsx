import { Img, staticFile } from "remotion";
import type { SceneSpec } from "./types";
import { themes, PaletteContext, type Palette, ACCENT_GRADIENT_ID, sunsetStops } from "./theme";
import { IconRef } from "../components/IconRef";
import { TextLayer } from "../components/TextLayer";
import { TitleOverlay } from "../components/TitleOverlay";
import { ListReveal } from "../components/ListReveal";
import { Flow } from "../components/Flow";
import { Comparison } from "../components/Comparison";
import { Hub } from "../components/Hub";
import { LottieRef } from "../components/LottieRef";

const resolveImageSource = (src: string): string => {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  return staticFile(src.replace(/^public\//, ""));
};

export const Scene: React.FC<{ spec: SceneSpec }> = ({ spec }) => {
  const base = themes[spec.theme];
  const palette: Palette = {
    background: spec.palette?.background ?? base.background,
    ink: spec.palette?.ink ?? base.ink,
    inkMuted: spec.palette?.inkMuted ?? base.inkMuted,
    inkDim: spec.palette?.inkDim ?? base.inkDim,
    accent: spec.palette?.accent ?? base.accent,
    accentDeep: spec.palette?.accentDeep ?? base.accentDeep,
    hairline: spec.palette?.hairline ?? base.hairline,
    bloom: spec.palette?.bloom ?? base.bloom,
    sunset: spec.palette?.sunset ?? base.sunset,
  };
  const background = spec.background ?? palette.background;
  const bgImage = spec.backgroundImage;
  const showBloom = spec.bloom && !bgImage;
  const stops = sunsetStops[spec.theme];

  return (
    <PaletteContext.Provider value={palette}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background,
        }}
      >
        <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <linearGradient id={ACCENT_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
              {stops.map((s, i) => (
                <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
        </svg>
        {showBloom ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: palette.bloom,
              pointerEvents: "none",
            }}
          />
        ) : null}
        {bgImage ? (
          <>
            <Img
              src={resolveImageSource(bgImage.source)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: bgImage.fit,
                opacity: bgImage.opacity,
              }}
            />
            {bgImage.tint && bgImage.tintOpacity > 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: bgImage.tint,
                  opacity: bgImage.tintOpacity,
                  pointerEvents: "none",
                }}
              />
            ) : null}
          </>
        ) : null}
        {spec.tracks.map((track) => {
          switch (track.kind) {
            case "icon":
              return <IconRef key={track.id} track={track} />;
            case "text":
              return <TextLayer key={track.id} track={track} />;
            case "title-overlay":
              return <TitleOverlay key={track.id} track={track} />;
            case "list-reveal":
              return <ListReveal key={track.id} track={track} />;
            case "flow":
              return <Flow key={track.id} track={track} />;
            case "comparison":
              return <Comparison key={track.id} track={track} />;
            case "hub":
              return <Hub key={track.id} track={track} />;
            case "lottie":
              return <LottieRef key={track.id} track={track} />;
          }
        })}
      </div>
    </PaletteContext.Provider>
  );
};
