import type { SceneSpec } from "./types";
import { themes, PaletteContext } from "./theme";
import { IconRef } from "../components/IconRef";
import { TextLayer } from "../components/TextLayer";
import { TitleOverlay } from "../components/TitleOverlay";
import { ListReveal } from "../components/ListReveal";
import { Flow } from "../components/Flow";
import { Comparison } from "../components/Comparison";
import { Hub } from "../components/Hub";
import { LottieRef } from "../components/LottieRef";

export const Scene: React.FC<{ spec: SceneSpec }> = ({ spec }) => {
  const palette = themes[spec.theme];
  const background = spec.background ?? palette.background;

  return (
    <PaletteContext.Provider value={palette}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background,
        }}
      >
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
