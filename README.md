# VideoOverlayKit

**Make b-roll for your videos. Tell an agent what you want. Get an MP4 back.**

Zero per-render cost. Wednesday Solutions design system as default. Built for people who ship a lot of short-form video and don't want to learn After Effects.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="examples/list-reveal.gif" alt="list-reveal preview" width="100%" />
      <br/>
      A title and three points appearing on cue. <a href="examples/list-reveal.json">spec</a> · <a href="examples/list-reveal.mp4">mp4</a>
    </td>
    <td align="center" width="50%">
      <img src="examples/flow.gif" alt="flow preview" width="100%" />
      <br/>
      A process: <i>incident → runbook → contained.</i> <a href="examples/flow.json">spec</a> · <a href="examples/flow.mp4">mp4</a>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="examples/comparison.gif" alt="comparison preview" width="100%" />
      <br/>
      Two things in contrast: <i>old way vs new way.</i> <a href="examples/comparison.json">spec</a> · <a href="examples/comparison.mp4">mp4</a>
    </td>
    <td align="center" width="50%">
      <img src="examples/hub.gif" alt="hub preview" width="100%" />
      <br/>
      A center concept and what hangs off it. <a href="examples/hub.json">spec</a> · <a href="examples/hub.mp4">mp4</a>
    </td>
  </tr>
</table>

Every clip above is real output — 5 to 6 seconds, 1080×1920 vertical, rendered with the default theme. Click any `mp4` for the full-quality version.

---

## Start here

Paste this into a fresh Claude Code or Codex session. The agent does the whole setup: clone, install, wire the MCP, verify. Then it's ready to make videos for you.

```
Set up github.com/alichherawalla/video-overlay-kit as an MCP server in my
Claude Code config.

1. Clone the repo to ~/code/video-overlay-kit (or ask me where to put it
   if that path is taken).
2. Run `npm install` inside the cloned directory.
3. Add a `video-overlay-kit` entry to my MCP config that runs
   `node <absolute-cloned-path>/bin/mcp.mjs`. Use the project's `.mcp.json`
   if I'm currently inside a git repo, otherwise my global
   `~/.claude/mcp_settings.json`. Preserve any existing MCP servers.
4. Verify the server starts by sending it a `tools/list` JSON-RPC request
   over stdio and confirming the tools `list_icons`, `validate_scene`, and
   `render_scene` come back.
5. Tell me to restart Claude Code so the new MCP server is picked up.

After setup, read the README at the cloned repo so you know how to author
scene specs. Default to the Wednesday Solutions light theme and 5-second
duration unless I say otherwise.
```

Restart Claude Code. Now you can ask for a video:

> "Make me a 5-second overlay titled 'A runbook for every incident' with three rows: drift, prompt injection, exfil attempts."

The agent picks the icons, writes the scene spec, renders the MP4, hands you the file path. Drop it into your editor.

If you'd rather wire the MCP yourself, skip to [Manual setup](#manual-setup-if-you-skip-the-one-shot-prompt).

---

## What you can make

Eight building blocks. Mix any combination of them in a single 4-to-6-second scene.

### `title-overlay` — the deliverable at the top of the frame

Use this on every scene. It's the "agenda bar" — the one-line promise of what the viewer is about to see. The Donald Miller grunt test applies: if a stranger reads the title and can't immediately tell what the video is about, rewrite it.

The bar lives at the top of the frame with a thin lavender accent underneath. Renders bold, 80pt, centered. You don't pick the position — it's fixed.

```jsonc
{ "kind": "title-overlay", "id": "agenda",
  "text": "How to control AI traffic",
  "startFrame": 0, "endFrame": 150 }
```

### `list-reveal` — three points appearing one at a time

The most common shape. Use this when you're saying "here are three things X gives you" — three outcomes, three steps, three checks. Each row gets an optional icon and reveals on a frame you specify.

```jsonc
{ "kind": "list-reveal", "id": "outcomes",
  "position": { "x": 0.5, "y": 0.55 },
  "startFrame": 20, "endFrame": 150,
  "rows": [
    { "text": "One gateway in front of every model", "iconName": "IconShield",   "revealAtFrame":  0 },
    { "text": "Input policy. Output policy.",        "iconName": "IconFilter",   "revealAtFrame": 35 },
    { "text": "Every prompt, every dollar, every output", "iconName": "IconChartBar", "revealAtFrame": 70 }
  ]
}
```

See `examples/list-reveal.mp4` for what this produces.

### `flow` — a process, left to right

Use this when the meaning is in the *sequence*: incident detected → runbook activated → contained. Each node appears, an arrow draws to the next one, the next node appears. 2 to 5 nodes.

```jsonc
{ "kind": "flow", "id": "incident-flow",
  "startFrame": 20, "endFrame": 150,
  "nodes": [
    { "iconName": "IconAlertOctagon", "label": "Incident" },
    { "iconName": "IconBook2",        "label": "Runbook" },
    { "iconName": "IconCircleCheck",  "label": "Contained" }
  ]
}
```

### `comparison` — two things side by side

Use this when the meaning is in the *contrast*: old vs new, cyber vs AI security, manual vs automated. The divider word in the middle is configurable — `"vs"` for opposition, `"+"` for addition, `"→"` for transition.

```jsonc
{ "kind": "comparison", "id": "old-vs-new",
  "startFrame": 20, "endFrame": 180,
  "left":  { "iconName": "IconClockHour3", "label": "Old way", "subLabel": "Manual review" },
  "right": { "iconName": "IconBolt",       "label": "New way", "subLabel": "Automated checks" },
  "divider": { "label": "vs", "showLine": true }
}
```

### `hub` — a center concept with satellites pointing in

Use this when one thing is at the *center* and others *hang off it*: a gateway that controls policy, logging, cost, and swap. The center appears first, then each satellite reveals with a line drawing in. 2 to 4 satellites.

```jsonc
{ "kind": "hub", "id": "gateway-hub",
  "startFrame": 20, "endFrame": 150,
  "center": { "iconName": "IconShield", "label": "Gateway" },
  "satellites": [
    { "iconName": "IconLock",     "label": "Policy" },
    { "iconName": "IconActivity", "label": "Logging" },
    { "iconName": "IconCoin",     "label": "Cost" },
    { "iconName": "IconRefresh",  "label": "Swap" }
  ]
}
```

### `icon`, `text`, `lottie` — the building blocks

If none of the composite components fit, drop a single icon, a free-position text block, or a pre-animated Lottie. These are the escape hatches for unusual layouts.

```jsonc
{ "kind": "icon", "id": "hero", "name": "IconShieldCheck",
  "position": { "x": 0.5, "y": 0.45 }, "sizePx": 240,
  "startFrame": 10, "endFrame": 150 }
```

Track kinds available: `title-overlay`, `list-reveal`, `flow`, `comparison`, `hub`, `icon`, `text`, `lottie`. Full field reference is in [the reference section](#reference) at the bottom — but most users never need to read it. The agent reads the schema for you.

---

## Customize the look

The kit ships with the **Wednesday Solutions** design system as the default theme — lavender accent on a warm off-white canvas. Everything is configurable. You don't edit JSON; you ask in plain language.

| Tell the agent | What happens in the spec |
|---|---|
| "Render it in dark mode" | `theme: "dark"` |
| "Use a black background" | `background: "#000000"` |
| "Put the team photo behind it" | `backgroundImage: { source: "team.jpg" }` |
| "Make the accent red instead of lavender" | `palette: { accent: "#E74C3C" }` |
| "Transparent background, I'll composite it myself" | `background: "transparent"` |

The codec auto-switches: solid backgrounds render H.264 MP4; `transparent` renders ProRes 4444 MOV with a real alpha channel.

If you want to change the *default* theme for every scene without saying so each time, edit `src/scene/theme.ts`. The palette is one object — change the hex values and every component picks them up.

---

## Manual setup (if you skip the one-shot prompt)

Clone, install, wire it into your Claude Code MCP config yourself:

```bash
git clone git@github.com:alichherawalla/video-overlay-kit.git
cd video-overlay-kit
npm install
```

Add to your project's `.mcp.json` (or your global `~/.claude/mcp_settings.json`):

```json
{
  "mcpServers": {
    "video-overlay-kit": {
      "command": "node",
      "args": ["/absolute/path/to/video-overlay-kit/bin/mcp.mjs"]
    }
  }
}
```

Restart Claude Code. Three tools appear under `video-overlay-kit`:

- **`list_icons(query?, limit?)`** — search the Tabler library by substring. ~5,000 line icons.
- **`validate_scene(spec)`** — schema check before render. Returns `{ ok, errors? }`.
- **`render_scene(spec, outPath?)`** — render to an MP4 (or `.mov` for transparent). Returns the file path.

First render downloads a headless Chrome (~93 MB) one time.

---

## CLI (if you don't use MCP at all)

```bash
npm run render examples/list-reveal.json
# -> examples/list-reveal.mp4

npm run render path/to/spec.json /where/to/save.mp4
```

For live iteration on a spec (auto-reload as you edit the JSON):

```bash
npm run preview
# opens Remotion Studio at http://localhost:3000
```

---

## Why this exists

Most short-form B2B video is a talking head with overlays — title at the top, three points on cue, an icon or two. Done well, the overlays carry as much of the message as the speaker.

You can hire an editor (₹500–2000 per reel, slow loop, dependency on a person). You can pay a SaaS like Submagic ($20/month, fixed style, AI-generated, varies). You can learn After Effects (real time investment, not scriptable).

This kit is the fourth path: **scriptable, deterministic, free, driven from Claude Code.** A small library of components keeps the visual language consistent across every reel you make. The agent handles the spec; you handle the message.

---

## Reference

Everything below is the full schema. Most users never read this — the agent reads it for you. Keep it open as a lookup when you're authoring specs by hand.

### Scene spec (top-level)

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Slug for the scene. Used as the default output filename. |
| `durationFrames` | `int` | required | Total length in frames. Must be 4–6 seconds at the given `fps`. Validated. |
| `fps` | `int` | `30` | Frame rate. |
| `width` | `int` | `1080` | Canvas width in px. |
| `height` | `int` | `1920` | Canvas height in px. Default is 9:16 vertical. |
| `theme` | `"light" \| "dark"` | `"light"` | Selects the palette. Light is the Wednesday Solutions default. |
| `background` | `string` | (from theme) | CSS color or `"transparent"`. Overrides the theme's canvas color. |
| `backgroundImage` | `object` | none | `{ source, opacity, fit, tint, tintOpacity }`. Renders behind the tracks. |
| `palette` | `object` | none | Per-scene partial palette override. See [Palette](#palette). |
| `tracks` | `Track[]` | required | The list of tracks. |

### Common track fields

| Field | Type | Default | Description |
|---|---|---|---|
| `kind` | enum | required | `title-overlay`, `list-reveal`, `flow`, `comparison`, `hub`, `icon`, `text`, `lottie`. |
| `id` | `string` | required | Unique within the scene. |
| `startFrame` | `int` | required | Frame at which the track becomes visible. |
| `endFrame` | `int` | required | Frame at which the track is removed. |
| `enter` | `Motion` | `{ kind: "fade", durationFrames: 8 }` | Entry animation. |
| `exit` | `Motion` | `{ kind: "none", durationFrames: 8 }` | Exit animation. |

### Motion (enter / exit)

`{ kind, durationFrames, ease }`. Available `kind` values:

| `kind` | Behavior |
|---|---|
| `fade` | Opacity ramp. |
| `slide-up` / `slide-down` / `slide-left` / `slide-right` | Enters translating from 80px in the named direction. |
| `scale` | Scale-in from 0.85 → 1.0 with opacity. |
| `none` | No motion. |

`ease`: `linear`, `easeIn`, `easeOut`, `easeInOut`. Default `easeOut`.

### Position

All track `position` fields are `{ x, y }` as 0..1 fractions of the canvas. The track's geometric center is placed at that point.

### Palette

Tokens defined in `src/scene/theme.ts`. The light palette (default):

| Token | Color | Used for |
|---|---|---|
| `background` | `#F0EDF8` | Canvas |
| `ink` | `#0B0B0D` | Primary text and icon strokes |
| `inkMuted` | `#3A3A4A` | Secondary text |
| `inkDim` | `#6B6B7E` | Tertiary text |
| `accent` | `#7A5BDC` | Lavender — connectors, accent bar, dividers, arrows, hub lines |
| `accentDeep` | `#5A3DB8` | Deeper lavender — pressed, ribbons (reserved) |
| `hairline` | `#CCCAE0` | Hairline borders |

Dark palette inverts these. Per-scene override via `palette: { accent: "#E74C3C", ... }`.

### Per-track field reference

Each track kind below lists the fields it accepts beyond the common fields above.

#### `title-overlay`

| Field | Type | Description |
|---|---|---|
| `text` | `string` | The title text. |

Position is fixed (top of frame). No `position` field.

#### `list-reveal`

| Field | Type | Description |
|---|---|---|
| `position` | `{ x, y }` | Center of the list block. |
| `rows` | `Row[]` (1-5) | The list rows. |
| `rows[].text` | `string` | Row label. |
| `rows[].iconName` | `string?` | Tabler icon name, optional. |
| `rows[].revealAtFrame` | `int` | Frame (relative to `startFrame`) when this row appears. |

#### `flow`

| Field | Type | Description |
|---|---|---|
| `position` | `{ x, y }` | Center of the flow block. |
| `nodes` | `Node[]` (2-5) | The sequence. |
| `nodes[].iconName` | `string` | Tabler icon. |
| `nodes[].label` | `string` | Label below the icon. |
| `direction` | `"horizontal"` | Only horizontal in v1. |
| `revealCadenceFrames` | `int` | Frames between successive nodes. Default 35. |

#### `comparison`

| Field | Type | Description |
|---|---|---|
| `position` | `{ x, y }` | Center of the comparison block. |
| `left`, `right` | `Side` | Each: `{ iconName, label, subLabel? }`. |
| `divider.label` | `string` | Center text. Default `"vs"`. |
| `divider.showLine` | `boolean` | Whether to draw the vertical line. Default `true`. |
| `revealCadenceFrames` | `int` | Frames between left → right → divider. Default 25. |

#### `hub`

| Field | Type | Description |
|---|---|---|
| `position` | `{ x, y }` | Center of the hub. |
| `center.iconName`, `center.label` | `string` | The central node. |
| `satellites` | `Satellite[]` (2-4) | Each: `{ iconName, label }`. |
| `revealCadenceFrames` | `int` | Frames between center → each satellite. Default 22. |

Layout is automatic: 2 satellites → top + bottom. 3 → triangle (top + lower-right + lower-left). 4 → cardinal.

#### `icon`

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Tabler icon name. |
| `position` | `{ x, y }` | required | Position on the canvas. |
| `sizePx` | `int` | `160` | Icon size. |
| `color` | `string` | (theme `ink`) | CSS color. |
| `strokeWidth` | `number` | `2` | Stroke width. |

#### `text`

| Field | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | required | The text. Supports `\n`. |
| `position` | `{ x, y }` | required | Position on the canvas. |
| `fontSizePx` | `int` | `56` | Font size. |
| `color` | `string` | (theme `ink`) | CSS color. |
| `fontWeight` | `400 \| 500 \| 600 \| 700 \| 800` | `600` | Weight. |
| `fontFamily` | `string` | (kit's Aeonik stack) | CSS font stack. |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Alignment. |
| `maxWidthPx` | `int` | unbounded | Wrap width. |

#### `lottie`

| Field | Type | Default | Description |
|---|---|---|---|
| `source` | `string` | required | URL or path relative to `public/`. |
| `position` | `{ x, y }` | required | Position. |
| `sizePx` | `int` | `400` | Width/height (square). |
| `loop` | `boolean` | `false` | Loop the animation. |
| `playbackRate` | `number` | `1` | Speed multiplier. |

### `backgroundImage`

| Field | Type | Default | Description |
|---|---|---|---|
| `source` | `string` | required | URL, `data:`, or `public/` path. |
| `opacity` | `number` | `1` | 0..1. |
| `fit` | `"cover" \| "contain"` | `"cover"` | CSS `object-fit`. |
| `tint` | `string?` | none | CSS color drawn over the image. |
| `tintOpacity` | `number` | `0` | Opacity of the tint. |

Layers stack as `background color → image → tint → tracks`.

### Constraints

- Duration: 4-6 seconds. Hard validation.
- Aspect: 9:16, 1080×1920. Default.
- Frame rate: 30 fps.
- Library: Tabler icons + line-style Lottie only. Mixing styles breaks visual consistency.
- Theme: Wednesday Solutions palette. Editable in `src/scene/theme.ts`.

### Output formats

| Background | Codec | Container | Use case |
|---|---|---|---|
| Any CSS color | H.264 | `.mp4` | Full-frame b-roll cut into your reel. |
| `"transparent"` | ProRes 4444 | `.mov` | Compositing over talking-head footage with alpha. |

### Project structure

```
video-overlay-kit/
├── bin/mcp.mjs              # MCP launcher
├── mcp/server.ts            # MCP server: list_icons, validate_scene, render_scene
├── scripts/render.ts        # CLI entry (npm run render)
├── src/
│   ├── Root.tsx, index.ts   # Remotion entry
│   ├── scene/
│   │   ├── types.ts         # Zod schema for the whole spec
│   │   ├── theme.ts         # Palette + font family
│   │   └── Scene.tsx        # Top-level renderer
│   ├── components/          # One file per track kind
│   ├── motion/              # Enter/exit transforms
│   └── lib/render.ts        # Shared by CLI and MCP
└── examples/                # Sample specs + their rendered MP4s and GIFs
```

### Extending it

To add a new track kind (say, `quote`):

1. Add `QuoteTrackSchema` in `src/scene/types.ts`, include in `TrackSchema` discriminated union, export the type.
2. Build `src/components/Quote.tsx` using `useCurrentFrame()` from Remotion and `trackStyle` from `../motion/primitives`. Read colors from `usePalette()` and the font from `FONT_FAMILY` in `src/scene/theme.ts`.
3. Register the new case in `src/scene/Scene.tsx`.
4. Optionally update the schema hint in `mcp/server.ts` so the agent knows the new kind exists.

The renderer and MCP tool handlers don't need changes. Copy `Flow.tsx` or `Hub.tsx` as a starting point for choreographed components.

---

## Cost

Zero per render. Local CPU and disk only. Free for individual use and small teams. Read each dependency's license if you're shipping commercially.

## Credits

- [Remotion](https://www.remotion.dev/) — the React-based video rendering engine.
- [Tabler Icons](https://tabler-icons.io/) — the icon library.
- [LottieFiles](https://lottiefiles.com/) — Lottie animation marketplace.
- [Model Context Protocol](https://modelcontextprotocol.io/) — the standard used to expose the kit to Claude Code.

## License

MIT.

## Issues, contributions

File issues at [github.com/alichherawalla/video-overlay-kit](https://github.com/alichherawalla/video-overlay-kit). The schema in `src/scene/types.ts` is the contract — propose the spec shape first when adding a new track kind, then the component.
