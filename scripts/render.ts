#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { renderScene } from "../src/lib/render";

const usage = `Usage: tsx scripts/render.ts <scene-spec.json> [output.mp4|.mov]`;

const main = async () => {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error(usage);
    process.exit(1);
  }
  const outPath = process.argv[3];
  const raw = JSON.parse(readFileSync(path.resolve(specPath), "utf8"));

  let lastBundle = -1;
  let lastRender = -1;
  const result = await renderScene(raw, outPath, (kind, pct) => {
    if (kind === "bundle" && pct !== lastBundle) {
      process.stdout.write(`\r  bundle: ${pct.toFixed(0)}%   `);
      lastBundle = pct;
    }
    if (kind === "render" && Math.floor(pct) !== lastRender) {
      process.stdout.write(`\r  render: ${pct.toFixed(0)}%   `);
      lastRender = Math.floor(pct);
    }
  });
  process.stdout.write("\n");
  console.log(`> done: ${result.outPath} (${result.durationSeconds.toFixed(2)}s, ${result.codec})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
