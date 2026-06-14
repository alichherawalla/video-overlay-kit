import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SceneSpecSchema, type SceneSpec } from "../scene/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

let bundlePromise: Promise<string> | null = null;

const getBundle = async (): Promise<string> => {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: path.join(projectRoot, "src", "index.ts"),
    });
  }
  return bundlePromise;
};

export type RenderResult = {
  ok: true;
  outPath: string;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  codec: "h264" | "prores";
};

export const validateSpec = (raw: unknown): { ok: true; spec: SceneSpec } | { ok: false; errors: unknown } => {
  const parsed = SceneSpecSchema.safeParse(raw);
  if (parsed.success) return { ok: true, spec: parsed.data };
  return { ok: false, errors: parsed.error.issues };
};

export const renderScene = async (
  raw: unknown,
  outPath?: string,
  onProgress?: (kind: "bundle" | "render", pct: number) => void,
): Promise<RenderResult> => {
  const v = validateSpec(raw);
  if (!v.ok) throw new Error(`Invalid scene spec: ${JSON.stringify(v.errors, null, 2)}`);
  const spec = v.spec;

  const transparent = spec.background === "transparent";
  const ext = transparent ? "mov" : "mp4";
  const resolvedOut = outPath
    ? path.resolve(outPath)
    : path.join(projectRoot, "output", `${spec.id}.${ext}`);

  const bundleLocation = await getBundle();
  if (onProgress) onProgress("bundle", 100);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "Overlay",
    inputProps: { spec },
  });

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: spec.durationFrames,
      fps: spec.fps,
      width: spec.width,
      height: spec.height,
    },
    serveUrl: bundleLocation,
    codec: transparent ? "prores" : "h264",
    proResProfile: transparent ? "4444" : undefined,
    pixelFormat: transparent ? "yuva444p10le" : "yuv420p",
    imageFormat: transparent ? "png" : "jpeg",
    outputLocation: resolvedOut,
    inputProps: { spec },
    onProgress: ({ progress }) => onProgress?.("render", progress * 100),
  });

  return {
    ok: true,
    outPath: resolvedOut,
    durationSeconds: spec.durationFrames / spec.fps,
    width: spec.width,
    height: spec.height,
    fps: spec.fps,
    codec: transparent ? "prores" : "h264",
  };
};
