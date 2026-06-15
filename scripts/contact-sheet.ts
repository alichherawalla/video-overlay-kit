#!/usr/bin/env tsx
// Render the last frame of every examples/*.json (and any extra spec passed
// on argv) into a single labeled grid PNG. Use after touching Flow / Hub /
// ListReveal / theme code to spot regressions across the matrix at a glance.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { validateSpec } from "../src/lib/render";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const CELL_W = 540;
const PADDING = 24;
const LABEL_H = 48;
const COLS = 4;

const collectSpecs = (extras: string[]): string[] => {
  const dir = path.join(projectRoot, "examples");
  const builtIn = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f))
    .sort();
  return [...builtIn, ...extras.map((p) => path.resolve(p))];
};

const main = async () => {
  const extras = process.argv.slice(2);
  const specPaths = collectSpecs(extras);
  console.log(`Rendering ${specPaths.length} specs...`);

  const tmpDir = mkdtempSync(path.join(tmpdir(), "contact-sheet-"));

  console.log("  bundling...");
  const bundleLocation = await bundle({
    entryPoint: path.join(projectRoot, "src", "index.ts"),
  });

  type Cell = { label: string; pngPath: string; w: number; h: number };
  const cells: Cell[] = [];

  for (const specPath of specPaths) {
    const label = path.basename(specPath, ".json");
    const raw = JSON.parse(readFileSync(specPath, "utf8"));
    const v = validateSpec(raw);
    if (!v.ok) {
      console.error(`  ✗ ${label}: invalid spec`, v.errors);
      continue;
    }
    const spec = v.spec;
    // Sample 15 frames before the end — past all enter/reveal animations,
    // and ahead of the typical 10-frame exit fade. Captures the "settled"
    // state where every track member is fully revealed.
    const settledFrame = Math.max(0, spec.durationFrames - 15);

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "Overlay",
      inputProps: { spec },
    });

    const pngPath = path.join(tmpDir, `${label}.png`);
    await renderStill({
      composition: {
        ...composition,
        durationInFrames: spec.durationFrames,
        fps: spec.fps,
        width: spec.width,
        height: spec.height,
      },
      serveUrl: bundleLocation,
      output: pngPath,
      frame: settledFrame,
      inputProps: { spec },
    });

    cells.push({ label, pngPath, w: spec.width, h: spec.height });
    console.log(`  ✓ ${label}`);
  }

  // Lay out cells. Each cell normalized to CELL_W width; height scales by aspect.
  const sized = await Promise.all(
    cells.map(async (c) => {
      const aspect = c.h / c.w;
      const targetW = CELL_W;
      const targetH = Math.round(targetW * aspect);
      const buf = await sharp(c.pngPath).resize(targetW, targetH, { fit: "fill" }).png().toBuffer();
      return { ...c, targetW, targetH, buf };
    }),
  );

  // Grid: COLS columns; each row's height = max cell height in that row.
  const rows: typeof sized[] = [];
  for (let i = 0; i < sized.length; i += COLS) rows.push(sized.slice(i, i + COLS));

  const rowHeights = rows.map((row) => Math.max(...row.map((c) => c.targetH)) + LABEL_H);
  const totalW = COLS * CELL_W + (COLS + 1) * PADDING;
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + (rows.length + 1) * PADDING;

  const composites: sharp.OverlayOptions[] = [];
  let y = PADDING;
  for (let r = 0; r < rows.length; r++) {
    let x = PADDING;
    for (const cell of rows[r]) {
      composites.push({ input: cell.buf, left: x, top: y });
      const labelSvg = `
        <svg width="${CELL_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1a1a1a"/>
          <text x="12" y="32" font-family="-apple-system, system-ui, sans-serif"
                font-size="22" font-weight="600" fill="#ffffff">${cell.label}</text>
        </svg>`;
      composites.push({
        input: Buffer.from(labelSvg),
        left: x,
        top: y + cell.targetH,
      });
      x += CELL_W + PADDING;
    }
    y += rowHeights[r] + PADDING;
  }

  const outPath = path.join(projectRoot, "contact-sheet.png");
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 30, g: 30, b: 30, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outPath);

  rmSync(tmpDir, { recursive: true, force: true });
  console.log(`> done: ${outPath} (${totalW}x${totalH})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
