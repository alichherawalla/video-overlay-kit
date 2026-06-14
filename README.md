# VideoOverlayKit

**Create b-roll animations for technical videos. High-quality content, free. Runs on your machine.**

You write a scene spec (icons + text + timings); the kit renders an MP4. No per-render cost, no API calls, no cloud. Drive it from Claude Code via MCP, or from the CLI directly.

```
git clone git@github.com:alichherawalla/video-overlay-kit.git
cd video-overlay-kit
npm install
npm run render examples/list-reveal.json
# -> examples/list-reveal.mp4
```

That's the whole onboarding path. First render downloads a headless Chrome (~93 MB) one time.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [The design rule](#the-design-rule-that-makes-this-work)
- [Scene spec (top-level)](#scene-spec-top-level)
- [Theme](#theme)
- [Common track fields](#common-track-fields)
- [Motion primitives (enter / exit)](#motion-primitives-enter--exit)
- [Position semantics](#position-semantics)
- **[Track kinds](#track-kinds)** — full schema and example for each:
  - [`title-overlay`](#title-overlay)
  - [`list-reveal`](#list-reveal)
  - [`flow`](#flow)
  - [`comparison`](#comparison)
  - [`hub`](#hub)
  - [`icon`](#icon)
  - [`text`](#text)
  - [`lottie`](#lottie)
- [Examples gallery](#examples-gallery)
- [Using it from Claude Code (MCP)](#using-it-from-claude-code-mcp)
- [CLI usage](#cli-usage)
- [Project structure](#project-structure)
- [Output formats](#output-formats)
- [Constraints](#constraints)
- [Extending it](#extending-it-adding-a-new-component)
- [What it does not do](#what-it-does-not-do)
- [Cost](#cost)
- [Credits & License](#credits)

---

## Why this exists

Most short-form B2B video (LinkedIn reels, YouTube Shorts, IG Reels) is a talking head with overlay graphics: a title at the top, a list of three points appearing on cue, an icon flow showing a process, two icons in comparison. Done well, the overlays carry as much of the message as the speaker.

Building those overlays takes one of three paths today:

1. **Hire an editor.** ₹500-2000 per reel. Slow loop, dependency on a person.
2. **Subscribe to Submagic / Captions.ai.** $20-25/month. Auto-overlay tools. Style is fixed, AI-generated, varies in quality.
3. **Learn After Effects.** Real time investment. Bespoke control but not scriptable from your terminal.

VideoOverlayKit is a fourth path: **a scriptable overlay generator that you drive from Claude Code (or a shell)**, using a curated component library so every video looks consistent. It is built for people who already write code and want a deterministic, free, repeatable way to render the visuals they need.

---

## The design rule that makes this work

The kit **orchestrates** existing visual objects. It does not generate new ones.

- Icons come from **Tabler Icons** (~5,000 line icons, one consistent visual language).
- Pre-animated motion comes from **LottieFiles** (use line-style animations to stay visually consistent).
- Text is the only thing you author per scene.

This is the discipline that keeps the look uniform across hundreds of reels: a single icon library, no custom illustrations, no mixing styles. The kit's job is to place objects, time them, and move them — not to invent visuals.

---

## Scene spec (top-level)

Every render takes a scene spec (JSON) and produces an MP4 (or `.mov` if you opt into a transparent background). A scene contains an array of **tracks**. The top-level fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Slug for the scene. Used as the default output filename. |
| `durationFrames` | `int` | required | Total length in frames. **Must be 4-6 seconds at the given `fps`** (validated). |
| `fps` | `int` | `30` | Frame rate. Don't change unless you have a specific reason. |
| `width` | `int` | `1080` | Canvas width in px. |
| `height` | `int` | `1920` | Canvas height in px. Default is 9:16 vertical. |
| `theme` | `"light" \| "dark"` | `"light"` | Color palette. Default is the Wednesday Solutions light palette. See [Theme](#theme). |
| `background` | `string` | (from theme) | Any CSS color, or `"transparent"` for an alpha-channel `.mov` render. If omitted, uses the theme's canvas color. |
| `tracks` | `Track[]` | required | The list of track objects (see below). |

Minimal example:

```jsonc
{
  "id": "my-scene",
  "durationFrames": 150,
  "tracks": [
    {
      "kind": "title-overlay",
      "id": "t1",
      "text": "Hello",
      "startFrame": 0,
      "endFrame": 150
    }
  ]
}
```

---

## Theme

The kit ships with the **Wednesday Solutions** design-system palette. Light mode is the default; dark mode is a single field flip on the scene spec.

The palette is centralized in `src/scene/theme.ts` and threaded through every component via React context. Components never hardcode colors — they read from the active palette.

### Light (default)

| Token | Color | Used for |
|---|---|---|
| `background` | `#F0EDF8` | Canvas (warm lavender-tinted off-white) |
| `ink` | `#0B0B0D` | Primary text and icon strokes |
| `inkMuted` | `#3A3A4A` | Secondary text (sub-labels) |
| `inkDim` | `#6B6B7E` | Tertiary text (hints, meta) |
| `accent` | `#7A5BDC` | Lavender — connectors, accent bar, dividers, arrows, hub lines |
| `accentDeep` | `#5A3DB8` | Deeper lavender — ribbons, pressed states (reserved) |
| `hairline` | `#CCCAE0` | Hairline borders |

### Dark

| Token | Color |
|---|---|
| `background` | `#0B0B0D` |
| `ink` | `#FFFFFF` |
| `inkMuted` | `#C7C7CE` |
| `inkDim` | `#8A8A92` |
| `accent` | `#9B74F2` |
| `accentDeep` | `#7A5BDC` |
| `hairline` | `#26262A` |

### Switching themes

Set `theme` at the top level of the scene spec:

```jsonc
{
  "id": "my-scene",
  "theme": "dark",
  "durationFrames": 150,
  "tracks": [ /* ... */ ]
}
```

This single flag swaps the background, ink, and accent colors across every component in the scene. Per-track `color` overrides (on `icon` and `text` tracks) still take precedence over the theme.

### Overriding the background only

If you want the dark canvas with light theme colors (or any other mismatch), set `background` explicitly:

```jsonc
{
  "theme": "light",
  "background": "#000000",
  /* ... */
}
```

The theme controls icon/text colors; `background` is independent.

### Customizing the palette

Edit `src/scene/theme.ts` to change either palette or add a new one. The palettes are typed via the `Palette` interface — all tokens are required.

### Font

The font stack is the Wednesday brand stack:

```
"Aeonik", ui-sans-serif, system-ui, -apple-system, sans-serif
```

Aeonik is proprietary. If you have a license, drop the `.woff2` files into `public/fonts/aeonik/` and the kit will pick them up. Without it, the kit falls back to the system sans-serif (San Francisco on macOS, Segoe UI on Windows) — clean and neutral.

---

## Common track fields

Every track, regardless of kind, supports these fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `kind` | enum | required | One of: `title-overlay`, `list-reveal`, `flow`, `comparison`, `hub`, `icon`, `text`, `lottie`. |
| `id` | `string` | required | Unique identifier within the scene. |
| `startFrame` | `int` | required | Frame at which the track becomes visible. |
| `endFrame` | `int` | required | Frame at which the track is removed. |
| `enter` | `Motion` | `{ kind: "fade", durationFrames: 8, ease: "easeOut" }` | Entry animation (see below). |
| `exit` | `Motion` | `{ kind: "none", durationFrames: 8, ease: "easeOut" }` | Exit animation (see below). |

---

## Motion primitives (enter / exit)

`enter` and `exit` are objects with the same shape:

```jsonc
{ "kind": "slide-down", "durationFrames": 10, "ease": "easeOut" }
```

| Field | Type | Default | Description |
|---|---|---|---|
| `kind` | enum | `"fade"` (enter) / `"none"` (exit) | One of: `fade`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `scale`, `none`. |
| `durationFrames` | `int` | `8` | How many frames the motion takes. |
| `ease` | enum | `"easeOut"` | One of: `linear`, `easeIn`, `easeOut`, `easeInOut`. |

What each `kind` does:

| `kind` | Behavior |
|---|---|
| `fade` | Opacity ramp 0 → 1 (enter) / 1 → 0 (exit). |
| `slide-up` | Enters translating up from 80px below. Exits translating up. |
| `slide-down` | Enters translating down from 80px above. Exits translating down. |
| `slide-left` | Enters translating left from 80px right. Exits translating left. |
| `slide-right` | Enters translating right from 80px left. Exits translating right. |
| `scale` | Scale-in from 0.85 → 1.0 with opacity. Scale-out on exit. |
| `none` | No motion. Element pops in / out. |

---

## Position semantics

Every track that supports a `position` field uses **fractional coordinates** of the canvas:

```jsonc
"position": { "x": 0.5, "y": 0.55 }
```

- `x: 0` is the left edge, `x: 0.5` is horizontal center, `x: 1` is the right edge.
- `y: 0` is the top edge, `y: 0.5` is vertical center, `y: 1` is the bottom edge.
- The track's geometric center is placed at this position.

This means specs are resolution-independent: changing `width`/`height` doesn't break the layout.

---

## Track kinds

Eight track kinds. Each one is documented below with its full field reference, an example spec, the preview MP4 it produces, and the command to render it.

### `title-overlay`

A bold deliverable title at the top of the frame with a thin charcoal accent bar underneath. Position is fixed to the top of the canvas — there is no `position` field.

Use it as the "agenda" for the clip — what the viewer will learn in the next 5 seconds. The grunt-test rule applies: the title should make the deliverable obvious in 3 seconds.

**Fields (in addition to the common ones):**

| Field | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | required | The title text. Sentence case. |

**Visual specs (fixed, by design):**

- Font: Inter / system sans-serif, 80pt, weight 700.
- Position: `top: 220px` (12% from top), centered horizontally.
- Accent bar: 160 × 4 px charcoal `#1a1a1a`, 28px below the title.

**Example:**

```jsonc
{
  "kind": "title-overlay",
  "id": "agenda",
  "text": "How to control AI traffic",
  "startFrame": 0,
  "endFrame": 150,
  "enter": { "kind": "slide-down", "durationFrames": 10, "ease": "easeOut" },
  "exit":  { "kind": "fade",       "durationFrames": 10, "ease": "easeOut" }
}
```

Title-overlay shows up in every other example below.

---

### `list-reveal`

A 1-5 row vertical list. Each row reveals in sequence with a small up-translate and opacity ramp. Rows can have an optional icon to the left of their text.

Use this for the three-outcome / three-step body of a beat. The canonical example: "One gateway in front of every model. Input policy. Output policy. Every prompt, every dollar, every output."

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `position` | `{ x, y }` | `{ x: 0.5, y: 0.5 }` | Center of the list block. |
| `rows` | `Row[]` (1-5) | required | Array of row objects. |
| `rows[].text` | `string` | required | Row label. |
| `rows[].iconName` | `string` | optional | Tabler icon name (PascalCase, e.g. `IconShield`). Left of the text. |
| `rows[].revealAtFrame` | `int` | required | Frame (relative to `startFrame`) at which this row appears. |

**Visual specs (fixed):**

- Container: 960px wide.
- Row height: 160px.
- Row gap: 36px.
- Icon size: 88px, stroke 2.
- Text: Inter 52pt, weight 500.

**Example: `examples/list-reveal.json` → `examples/list-reveal.mp4`**

```jsonc
{
  "kind": "list-reveal",
  "id": "three-outcomes",
  "position": { "x": 0.5, "y": 0.55 },
  "startFrame": 20,
  "endFrame": 150,
  "rows": [
    { "text": "One gateway in front of every model",        "iconName": "IconShield",    "revealAtFrame": 0  },
    { "text": "Input policy. Output policy.",                "iconName": "IconFilter",    "revealAtFrame": 35 },
    { "text": "Every prompt, every dollar, every output",    "iconName": "IconChartBar",  "revealAtFrame": 70 }
  ]
}
```

Render:

```bash
npm run render examples/list-reveal.json
```

---

### `flow`

A horizontal sequence of 2-5 icons connected by arrows that draw on in order. Each node has an icon and a label below it.

Use this for processes, pipelines, before/after sequences, A → B → C. The script "incident detected → runbook activated → contained" is a textbook flow.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `position` | `{ x, y }` | `{ x: 0.5, y: 0.55 }` | Center of the flow block. |
| `nodes` | `Node[]` (2-5) | required | Array of node objects. |
| `nodes[].iconName` | `string` | required | Tabler icon name. |
| `nodes[].label` | `string` | required | Label below the icon. |
| `direction` | enum | `"horizontal"` | Currently only `"horizontal"` is implemented. |
| `revealCadenceFrames` | `int` | `35` | Frames between successive nodes appearing. |

**Visual specs (fixed):**

- Container: 1000px wide. Nodes distribute evenly across it.
- Icon: 96px, stroke 2, in a 140px box.
- Label: Inter 32pt, weight 600.
- Arrow: 4px stroke, charcoal `#1a1a1a`. Arrowhead size 16px.
- Arrow draws over 14 frames midway between successive node reveals.

**Example: `examples/flow.json` → `examples/flow.mp4`**

```jsonc
{
  "kind": "flow",
  "id": "incident-flow",
  "position": { "x": 0.5, "y": 0.55 },
  "direction": "horizontal",
  "revealCadenceFrames": 35,
  "startFrame": 20,
  "endFrame": 150,
  "nodes": [
    { "iconName": "IconAlertOctagon", "label": "Incident" },
    { "iconName": "IconBook2",        "label": "Runbook" },
    { "iconName": "IconCircleCheck",  "label": "Contained" }
  ]
}
```

Render:

```bash
npm run render examples/flow.json
```

---

### `comparison`

Two icons side-by-side with a divider between them. Each side has an icon, a primary label, and an optional secondary sub-label underneath.

Use this for binary contrasts: old way vs new way, cyber vs AI security, manual vs automated. The divider's label is configurable — usually `"vs"` for opposition, `"+"` for addition, `"→"` for transition.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `position` | `{ x, y }` | `{ x: 0.5, y: 0.55 }` | Center of the comparison block. |
| `left` | `Side` | required | Left side. |
| `right` | `Side` | required | Right side. |
| `divider.label` | `string` | `"vs"` | Text shown in the center. Rendered lowercase. |
| `divider.showLine` | `boolean` | `true` | Whether to draw the vertical dividing line. |
| `revealCadenceFrames` | `int` | `25` | Frames between left appearing, right appearing, and divider settling. |

**`Side` shape:**

| Field | Type | Required | Description |
|---|---|---|---|
| `iconName` | `string` | yes | Tabler icon name. |
| `label` | `string` | yes | Primary label. |
| `subLabel` | `string` | no | Secondary line beneath the primary label. |

**Visual specs (fixed):**

- Container: 1000px wide, sides 440px each, divider 120px.
- Icon: 120px.
- Primary label: Inter 42pt, weight 700.
- Sub-label: Inter 28pt, weight 400, color `#666`.
- Divider line: 3 × 180 px charcoal vertical bar.

**Example: `examples/comparison.json` → `examples/comparison.mp4`**

```jsonc
{
  "kind": "comparison",
  "id": "old-vs-new",
  "position": { "x": 0.5, "y": 0.55 },
  "startFrame": 20,
  "endFrame": 180,
  "left":  { "iconName": "IconClockHour3", "label": "Old way",  "subLabel": "Manual review" },
  "right": { "iconName": "IconBolt",       "label": "New way",  "subLabel": "Automated checks" },
  "divider": { "label": "vs", "showLine": true },
  "revealCadenceFrames": 25
}
```

Render:

```bash
npm run render examples/comparison.json
```

---

### `hub`

A central icon with 2-4 satellites arranged around it. Connecting lines draw in as each satellite appears.

Use this for "X is the center of Y, Z, W" frames — wheel-and-spoke concepts. The canonical example: a Gateway in the center, with Policy, Logging, Cost, and Swap as satellites.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `position` | `{ x, y }` | `{ x: 0.5, y: 0.55 }` | Center of the hub block. |
| `center.iconName` | `string` | required | Tabler icon for the center. |
| `center.label` | `string` | required | Label for the center. |
| `satellites` | `Satellite[]` (2-4) | required | The orbiting nodes. |
| `satellites[].iconName` | `string` | required | Tabler icon name. |
| `satellites[].label` | `string` | required | Label for the satellite. |
| `revealCadenceFrames` | `int` | `22` | Frames between center appearing and each satellite appearing in sequence. |

**Satellite layout (automatic, by count):**

| Count | Positions |
|---|---|
| 2 | Top, bottom. |
| 3 | Top, lower-right, lower-left (triangle pointing up). |
| 4 | Cardinal: top, right, bottom, left. |

**Visual specs (fixed):**

- Container: 900 × 900 px.
- Center icon: 140px (rendered at 112px), Inter 30pt label.
- Satellite icons: 88px, Inter 26pt label.
- Orbital radius: 290px from center.
- Connecting lines: 3px stroke charcoal. Lines automatically clear both the center label and the satellite label (the geometry has extra padding on downward and upward lines respectively).

**Example: `examples/hub.json` → `examples/hub.mp4`**

```jsonc
{
  "kind": "hub",
  "id": "gateway-hub",
  "position": { "x": 0.5, "y": 0.58 },
  "startFrame": 20,
  "endFrame": 150,
  "center": { "iconName": "IconShield", "label": "Gateway" },
  "satellites": [
    { "iconName": "IconLock",     "label": "Policy" },
    { "iconName": "IconActivity", "label": "Logging" },
    { "iconName": "IconCoin",     "label": "Cost" },
    { "iconName": "IconRefresh",  "label": "Swap" }
  ],
  "revealCadenceFrames": 22
}
```

Render:

```bash
npm run render examples/hub.json
```

---

### `icon`

A single Tabler icon at an arbitrary position. Use this when none of the composite components fit — a hero icon, a callout, an isolated visual.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Tabler icon name (e.g. `IconShieldCheck`). |
| `position` | `{ x, y }` | required | Center of the icon (0..1 fractions). |
| `sizePx` | `int` | `160` | Icon size in px. |
| `color` | `string` | `"#1a1a1a"` | CSS color. |
| `strokeWidth` | `number` | `2` | Stroke width passed to the icon (Tabler icons are line-style). |

**Example:**

```jsonc
{
  "kind": "icon",
  "id": "hero-shield",
  "name": "IconShieldCheck",
  "position": { "x": 0.5, "y": 0.45 },
  "sizePx": 240,
  "color": "#1a1a1a",
  "strokeWidth": 2,
  "startFrame": 10,
  "endFrame": 150,
  "enter": { "kind": "scale", "durationFrames": 14, "ease": "easeOut" }
}
```

To find icon names: use the `list_icons` MCP tool, or browse [tabler-icons.io](https://tabler-icons.io/). All names are in PascalCase prefixed with `Icon`.

---

### `text`

A free-position text block. Use this when neither `title-overlay` nor `list-reveal` fits — a footer, a watermark, a number callout, a caption line.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | required | The text content. Supports `\n` newlines. |
| `position` | `{ x, y }` | required | Center of the text block. |
| `fontSizePx` | `int` | `56` | Font size in px. |
| `color` | `string` | `"#1a1a1a"` | CSS color. |
| `fontWeight` | `400 \| 500 \| 600 \| 700 \| 800` | `600` | Weight. |
| `fontFamily` | `string` | `"Inter, system-ui, sans-serif"` | CSS font stack. |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Text alignment within the block. |
| `maxWidthPx` | `int` | unbounded | Wrap width. |

**Example:**

```jsonc
{
  "kind": "text",
  "id": "footer",
  "text": "Stage 5",
  "position": { "x": 0.5, "y": 0.9 },
  "fontSizePx": 48,
  "fontWeight": 700,
  "color": "#1a1a1a",
  "align": "center",
  "startFrame": 30,
  "endFrame": 150
}
```

---

### `lottie`

A pre-animated Lottie composition. Loads from a URL or a local path under the kit's `public/` directory.

Use this for canonical motion that's hard to do with primitives: checkmark draws, paper reveals, hand-drawn flourishes. Filter to **line-style** Lotties on LottieFiles to keep the look consistent with Tabler icons.

**Fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `source` | `string` | required | URL (`https://...`) or path relative to `public/`. |
| `position` | `{ x, y }` | required | Center of the Lottie block. |
| `sizePx` | `int` | `400` | Width/height in px (assumes square Lottie). |
| `loop` | `boolean` | `false` | Whether to loop the animation. |
| `playbackRate` | `number` | `1` | Speed multiplier. |

**Example:**

```jsonc
{
  "kind": "lottie",
  "id": "checkmark",
  "source": "https://lottie.host/example/checkmark.json",
  "position": { "x": 0.5, "y": 0.5 },
  "sizePx": 400,
  "loop": false,
  "playbackRate": 1,
  "startFrame": 60,
  "endFrame": 150
}
```

---

## Examples gallery

All examples are in `examples/`. Each `.json` ships alongside the `.mp4` it renders to, so you can preview before you render.

| Example | Spec | Preview | What it shows |
|---|---|---|---|
| List reveal | [`examples/list-reveal.json`](examples/list-reveal.json) | [`examples/list-reveal.mp4`](examples/list-reveal.mp4) | `title-overlay` + `list-reveal` with 3 rows. 5 seconds. |
| Flow | [`examples/flow.json`](examples/flow.json) | [`examples/flow.mp4`](examples/flow.mp4) | `title-overlay` + `flow` with 3 nodes and arrows. 5 seconds. |
| Comparison | [`examples/comparison.json`](examples/comparison.json) | [`examples/comparison.mp4`](examples/comparison.mp4) | `title-overlay` + `comparison` with `vs` divider. 6 seconds. |
| Hub | [`examples/hub.json`](examples/hub.json) | [`examples/hub.mp4`](examples/hub.mp4) | `title-overlay` + `hub` with 4 satellites in cardinal layout. 5 seconds. |

Render any of them:

```bash
npm run render examples/list-reveal.json
npm run render examples/flow.json
npm run render examples/comparison.json
npm run render examples/hub.json
```

The first run downloads headless Chrome (~93 MB) and bundles Remotion (a few seconds). Subsequent runs are much faster — bundling is cached and the render itself is the main cost. Each render is local CPU only.

---

## Using it from Claude Code (MCP)

The kit ships an MCP server so Claude Code can author and render scenes directly without you hand-editing JSON.

### Wire it up

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

If you cloned the kit into a subdirectory of your project (e.g., `tools/video-overlay-kit/`), use a project-relative path:

```json
"args": ["tools/video-overlay-kit/bin/mcp.mjs"]
```

Restart Claude Code. The kit's tools appear under the `video-overlay-kit` MCP server.

### Available tools

| Tool | Inputs | Returns |
|---|---|---|
| `list_icons(query?, limit?)` | `query`: substring to match (case-insensitive). `limit`: max results (default 30). | `{ total, returned, icons }` — matching Tabler icon names. |
| `validate_scene(spec)` | `spec`: a scene spec object. | `{ ok: true, spec }` or `{ ok: false, errors }`. |
| `render_scene(spec, outPath?)` | `spec`: scene spec. `outPath`: absolute or repo-relative output path. | `{ ok: true, outPath, durationSeconds, width, height, fps, codec }`. |

### Example session

You: *"Render a 5-second flow with three nodes: Incident, Runbook, Contained. Title it 'Hit. Routed. Contained.' Save to ./out.mp4."*

Claude Code:

1. Calls `list_icons("alert")` → finds `IconAlertOctagon`, `IconAlertTriangle`, etc.
2. Calls `list_icons("book")` → finds `IconBook2`.
3. Authors the spec.
4. Calls `validate_scene(spec)` to confirm shape.
5. Calls `render_scene(spec, "./out.mp4")`.
6. Returns the file path.

You drop the resulting MP4 into your editor.

---

## CLI usage

```bash
npm run render <scene-spec.json> [output-path]
```

Examples:

```bash
# Render the bundled example; output to examples/list-reveal.mp4 next to the spec
npm run render examples/list-reveal.json

# Render to a custom path
npm run render examples/flow.json /tmp/my-flow.mp4

# Render to a path that doesn't exist yet (directories auto-created)
npm run render examples/hub.json ../reels/stage-1/overlays/hub.mp4
```

When `[output-path]` is omitted, the renderer writes to `output/<spec.id>.<mp4|mov>` inside the kit directory.

For an interactive live-reload preview while iterating:

```bash
npm run preview
# opens Remotion Studio at http://localhost:3000
```

In Studio, edit `examples/<name>.json` and the preview updates as you save.

---

## Project structure

```
video-overlay-kit/
├── README.md                  # this file
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── .mcp.json                  # if added at the repo root for Claude Code consumers
├── bin/
│   └── mcp.mjs                # cross-platform launcher used by .mcp.json
├── mcp/
│   └── server.ts              # MCP server: list_icons, validate_scene, render_scene
├── scripts/
│   └── render.ts              # CLI entry: npm run render
├── src/
│   ├── index.ts               # Remotion registerRoot()
│   ├── Root.tsx               # Composition registration
│   ├── scene/
│   │   ├── types.ts           # Zod schema + TypeScript types for SceneSpec
│   │   └── Scene.tsx          # Renders a SceneSpec
│   ├── components/
│   │   ├── TitleOverlay.tsx
│   │   ├── ListReveal.tsx
│   │   ├── Flow.tsx           # Horizontal sequence with drawing arrows
│   │   ├── Comparison.tsx     # Two icons with a center divider
│   │   ├── Hub.tsx            # Center icon with satellites + lines
│   │   ├── IconRef.tsx        # Renders a Tabler icon by name
│   │   ├── TextLayer.tsx
│   │   └── LottieRef.tsx
│   ├── motion/
│   │   └── primitives.ts      # Enter/exit transform math
│   └── lib/
│       └── render.ts          # Shared render function used by both CLI and MCP
├── examples/
│   ├── list-reveal.json + .mp4
│   ├── flow.json + .mp4
│   ├── comparison.json + .mp4
│   └── hub.json + .mp4
└── output/                    # gitignored, default render destination
```

---

## Output formats

The codec is automatic based on the `background` field:

| `background` | Codec | Container | Pixel format | Use case |
|---|---|---|---|---|
| Any CSS color (default `#ffffff`) | H.264 | `.mp4` | yuv420p | Full-frame b-roll cut into your reel |
| `"transparent"` | ProRes 4444 | `.mov` | yuva444p10le | Compositing over talking-head footage with an alpha channel |

ProRes .mov files are large (~5x the size of equivalent H.264 .mp4) but preserve a true alpha channel that editors can composite cleanly.

---

## Constraints

These are enforced by the schema and the renderer. Don't fight them — they're the point.

- **Duration: 4-6 seconds.** Anything outside fails validation. Short-form video viewers don't sustain attention longer; longer also pushes you over the 60s reel cap when combined with talking-head footage.
- **Aspect: 9:16, 1080×1920.** Override only if you really need a different format (e.g., square for some platforms).
- **Frame rate: 30 fps.** Industry standard for short-form social.
- **Background: white by default.** Use transparent only when you want the editor to composite.
- **Library: Tabler icons + line-style Lottie only.** Mixing icon styles breaks visual consistency across a reel series.
- **Theme: Wednesday Solutions palette.** Light by default, dark via `"theme": "dark"`. Change palettes by editing `src/scene/theme.ts`.

Without these constraints, the kit's output drifts in style across reels and you spend time on style decisions instead of content. The constraints make the kit boring on purpose; the *content* is what should vary, not the look.

---

## Extending it (adding a new component)

The pattern is consistent across all eight track kinds. To add (say) a `quote` track:

1. **Add a track schema** in `src/scene/types.ts`:

   ```ts
   export const QuoteTrackSchema = BaseTrackSchema.extend({
     kind: z.literal("quote"),
     text: z.string(),
     attribution: z.string().optional(),
     position: PositionSchema.default({ x: 0.5, y: 0.5 }),
   });

   // Add it to the discriminated union
   export const TrackSchema = z.discriminatedUnion("kind", [
     // ...existing schemas
     QuoteTrackSchema,
   ]);

   export type QuoteTrack = z.infer<typeof QuoteTrackSchema>;
   ```

2. **Build the React component** at `src/components/Quote.tsx`. Import `useCurrentFrame` from Remotion and `trackStyle` / `phaseProgress` from `../motion/primitives` to drive enter/exit and any internal animations.

3. **Register it** in `src/scene/Scene.tsx`:

   ```tsx
   case "quote":
     return <Quote key={track.id} track={track} />;
   ```

4. **(Optional) Update the MCP server hint** in `mcp/server.ts` so Claude Code knows the new kind exists.

5. **Done.** No changes to the renderer, the CLI, or `mcp/server.ts`'s tool handlers. The schema validates the new kind; the existing tools accept arbitrary spec objects and validate against the discriminated union.

For a static-position component (icon, text), copy `IconRef.tsx` as a starting point. For a multi-element choreographed component with connectors, copy `Flow.tsx` or `Hub.tsx` — both render SVG geometry for connectors and time element reveals against `useCurrentFrame()`.

---

## What it does not do

- **Generate icons or illustrations.** Use Tabler or LottieFiles. Bring your own SVGs if you must — file an issue if you want a `BringYourOwnSvg` track kind, the pattern is the same as the others.
- **Composite the talking-head video for you.** The kit produces an overlay clip. Your editor (or a separate Remotion composition) handles the final composite.
- **Transcribe audio or auto-generate captions.** Captions on the spoken track are a separate concern. If you want them, run Whisper externally and add the timings to a `text` track per word.
- **Mix visual styles.** By design — see the design rule at the top.

---

## Cost

**Zero per render.** Local CPU and disk only. Dependencies (Remotion, Tabler Icons, Lottie, FFmpeg, headless Chrome) are all free for individual use and small teams. Read each license if you plan to ship this commercially.

For reference, one of the bundled examples renders in roughly 5-15 seconds depending on hardware. Bundling the Remotion entry happens once per CLI invocation (~3 seconds) and once per MCP server lifetime (cached after the first call).

---

## Credits

- [Remotion](https://www.remotion.dev/) — the React-based video rendering engine. The kit is a thin wrapper around it.
- [Tabler Icons](https://tabler-icons.io/) — the icon library that supplies every visual object in the kit.
- [LottieFiles](https://lottiefiles.com/) — Lottie animation marketplace.
- [Model Context Protocol](https://modelcontextprotocol.io/) — the MCP standard used to expose the kit to Claude Code.

---

## License

MIT.

---

## Issues, ideas, contributions

File issues at [github.com/alichherawalla/video-overlay-kit](https://github.com/alichherawalla/video-overlay-kit). The schema in `src/scene/types.ts` is the contract: if you want a new track kind, propose the spec shape first, then the component. The renderer and MCP server don't need changes when new tracks are added.
