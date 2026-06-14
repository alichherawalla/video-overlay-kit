#!/usr/bin/env tsx
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { renderScene, validateSpec } from "../src/lib/render";
import * as TablerIcons from "@tabler/icons-react";

const ALL_ICON_NAMES = Object.keys(TablerIcons).filter((k) => k.startsWith("Icon") && k !== "Icon");

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
      name: "validate_scene",
      description:
        "Validate a scene spec against the schema without rendering. Returns { ok, errors? }. Useful to check structure before render_scene.",
      inputSchema: {
        type: "object",
        properties: { spec: SCENE_SCHEMA_HINT },
        required: ["spec"],
      },
    },
    {
      name: "render_scene",
      description:
        "Render a scene spec to an MP4 (or .mov if background is 'transparent'). Returns { ok, outPath, durationSeconds, codec }. Always uses 9:16 portrait (1080x1920) at 30fps unless overridden. Duration must be 4-6 seconds.",
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
