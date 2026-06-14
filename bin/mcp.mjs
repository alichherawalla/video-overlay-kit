#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(__dirname, "..");
const tsxBin = path.join(
  kitRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);
const serverEntry = path.join(kitRoot, "mcp", "server.ts");

const child = spawn(tsxBin, [serverEntry, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: kitRoot,
});
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("Failed to start video-overlay-kit MCP server:", err.message);
  console.error("Did you run `npm install` inside tools/video-overlay-kit/?");
  process.exit(1);
});
