#!/usr/bin/env tsx
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { renderScene, validateSpec } from "../src/lib/render";
import * as TablerIcons from "@tabler/icons-react";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = path.resolve(__dirname, "..", "examples");

const ALL_ICON_NAMES = Object.keys(TablerIcons).filter((k) => k.startsWith("Icon") && k !== "Icon");

type ExampleEntry = { name: string; kinds: string[]; orientation: "portrait" | "landscape"; spec: unknown };

const loadExamples = (): ExampleEntry[] => {
  const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((f): ExampleEntry => {
      const spec = JSON.parse(readFileSync(path.join(EXAMPLES_DIR, f), "utf8")) as {
        width?: number;
        height?: number;
        tracks?: { kind: string }[];
      };
      const kinds = Array.from(new Set((spec.tracks ?? []).map((t) => t.kind)));
      const orientation: "portrait" | "landscape" =
        (spec.width ?? 1080) > (spec.height ?? 1920) ? "landscape" : "portrait";
      return { name: path.basename(f, ".json"), kinds, orientation, spec };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

const EXAMPLES = loadExamples();

const SCENE_SCHEMA_HINT = {
  type: "object",
  description:
    "A scene spec. Top-level: { id, durationFrames, fps?, width?, height?, theme?, background?, backgroundImage?, palette?, tracks[] }. " +
    "durationFrames/fps MUST be between 4 and 6 seconds. Default fps=30, width=1080, height=1920. " +
    "theme='light' (default) or 'dark' selects the Wednesday Solutions palette. " +
    "background overrides the theme's canvas color; set 'transparent' for an alpha-channel .mov render. " +
    "backgroundImage={source(URL or public/ path), opacity?=1, fit?='cover'|'contain', tint?, tintOpacity?=0} renders behind tracks. " +
    "palette={background?, ink?, inkMuted?, inkDim?, accent?, accentDeep?, hairline?} overrides individual theme colors. " +
    "Each track has { kind, id, startFrame, endFrame, enter?, exit? } plus kind-specific fields. " +
    "Kinds: 'title-overlay' (text), 'list-reveal' (rows[].{text, iconName?, revealAtFrame}, position{x,y}), " +
    "'flow' (nodes[].{iconName, label}, position{x,y}, direction='horizontal', revealCadenceFrames=35 — left-to-right icon flow with arrows drawing between them), " +
    "'comparison' (left{iconName,label,subLabel?}, right{iconName,label,subLabel?}, divider{label='vs', showLine=true} — side-by-side contrast with a center divider), " +
    "'hub' (center{iconName,label}, satellites[2-4].{iconName,label}, position{x,y}, revealCadenceFrames=22 — central icon with N satellites connecting in via lines), " +
    "'icon' (name, position, sizePx?, color?), 'text' (text, position, fontSizePx?, color?), " +
    "'lottie' (source, position, sizePx?, loop?). Position x,y are 0..1 fractions of canvas.",
};

const KIND_PICKER_HINT =
  "PICK THE TRACK KIND BY CONTENT SHAPE, not by default. Do not reach for 'list-reveal' " +
  "unless the content is genuinely a flat enumeration of >=3 peer items. " +
  "Use 'flow' when describing a pipeline / sequence / before→after path (A → B → C). " +
  "Use 'hub' when one central concept connects to 2-4 related satellites. " +
  "Use 'comparison' for a two-sided contrast (old vs new, before vs after). " +
  "Use 'title-overlay' for a hero text card with no diagram. " +
  "Call list_examples first to see a canonical spec for each kind before authoring. " +
  "Both portrait (1080x1920, default — reels / shorts / TikTok) and landscape (1920x1080 — " +
  "YouTube / LinkedIn / web embeds) are supported; ask the user or infer from context which " +
  "they want. Layouts auto-flip (e.g. 'flow' is vertical in portrait, horizontal in landscape).";

const server = new Server(
  { name: "video-overlay-kit", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_icons",
      description:
        "Search the Tabler icon library by name substring. Returns icon names usable in scene specs (e.g. 'IconShield', 'IconAlertTriangle'). All Tabler icons are line-style and use a consistent visual language.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Substring to match against icon names (case-insensitive)." },
          limit: { type: "number", description: "Max results (default 30).", default: 30 },
        },
      },
    },
    {
      name: "list_examples",
      description:
        "List the canonical scene examples bundled with the kit. Returns an array of { name, kinds, orientation } entries — one per spec in examples/. " +
        "ALWAYS call this before authoring a new scene so you can pick the closest example to clone instead of writing from scratch. " +
        KIND_PICKER_HINT,
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_example",
      description:
        "Fetch the full JSON spec of a named example (from list_examples). Use the returned spec as a starting template — change icons, labels, title text, and durations, but keep the track structure that matches your content shape.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Example name (without .json). Use list_examples to discover." },
        },
        required: ["name"],
      },
    },
    {
      name: "validate_scene",
      description:
        "Validate a scene spec against the schema without rendering. Returns { ok, errors? }. Useful to check structure before render_scene. " +
        KIND_PICKER_HINT,
      inputSchema: {
        type: "object",
        properties: { spec: SCENE_SCHEMA_HINT },
        required: ["spec"],
      },
    },
    {
      name: "render_scene",
      description:
        "Render a scene spec to an MP4 (or .mov if background is 'transparent'). Returns { ok, outPath, durationSeconds, codec }. " +
        "Defaults to 9:16 portrait (1080x1920) at 30fps; set width=1920, height=1080 for landscape. Duration must be 4-6 seconds. " +
        KIND_PICKER_HINT,
      inputSchema: {
        type: "object",
        properties: {
          spec: SCENE_SCHEMA_HINT,
          outPath: {
            type: "string",
            description:
              "Absolute or repo-relative path to write the rendered file. If omitted, writes to <kit>/output/<spec.id>.<mp4|mov>.",
          },
        },
        required: ["spec"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === "list_icons") {
      const q = ((args?.query as string) ?? "").toLowerCase();
      const limit = (args?.limit as number) ?? 30;
      const filtered = q ? ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ALL_ICON_NAMES;
      const sliced = filtered.slice(0, limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ total: filtered.length, returned: sliced.length, icons: sliced }, null, 2),
          },
        ],
      };
    }
    if (name === "list_examples") {
      const summary = EXAMPLES.map(({ name, kinds, orientation }) => ({ name, kinds, orientation }));
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
    if (name === "get_example") {
      const wanted = args?.name as string | undefined;
      const found = EXAMPLES.find((e) => e.name === wanted);
      if (!found) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ok: false, error: `No example named '${wanted}'. Call list_examples for valid names.` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(found.spec, null, 2) }] };
    }
    if (name === "validate_scene") {
      const result = validateSpec(args?.spec);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "render_scene") {
      const spec = args?.spec;
      const outPath = args?.outPath as string | undefined;
      const result = await renderScene(spec, outPath);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
