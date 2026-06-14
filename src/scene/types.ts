import { z } from "zod";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const EaseSchema = z.enum(["linear", "easeIn", "easeOut", "easeInOut"]).default("easeOut");

const PositionSchema = z.object({
  x: z.number().describe("0..1, fraction of canvas width"),
  y: z.number().describe("0..1, fraction of canvas height"),
});

const BaseTrackSchema = z.object({
  id: z.string(),
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().min(0),
  enter: z
    .object({
      kind: z.enum(["fade", "slide-up", "slide-down", "slide-left", "slide-right", "scale", "none"]).default("fade"),
      durationFrames: z.number().int().min(0).default(8),
      ease: EaseSchema,
    })
    .default({}),
  exit: z
    .object({
      kind: z.enum(["fade", "slide-up", "slide-down", "slide-left", "slide-right", "scale", "none"]).default("none"),
      durationFrames: z.number().int().min(0).default(8),
      ease: EaseSchema,
    })
    .default({}),
});

export const IconTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("icon"),
  name: z.string().describe("Tabler icon name in PascalCase, e.g. IconShield"),
  position: PositionSchema,
  sizePx: z.number().int().positive().default(160),
  color: z.string().optional().describe("CSS color. Defaults to the theme's ink color."),
  strokeWidth: z.number().positive().default(2),
});

export const TextTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("text"),
  text: z.string(),
  position: PositionSchema,
  fontSizePx: z.number().int().positive().default(56),
  color: z.string().optional().describe("CSS color. Defaults to the theme's ink color."),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]).default(600),
  fontFamily: z.string().optional().describe("CSS font stack. Defaults to the kit's Aeonik stack."),
  align: z.enum(["left", "center", "right"]).default("center"),
  maxWidthPx: z.number().int().positive().optional(),
});

export const TitleOverlayTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("title-overlay"),
  text: z.string().describe("The named-deliverable title, e.g. 'How to control AI traffic'"),
  useGradient: z
    .boolean()
    .optional()
    .describe("Render the text in the theme's sunset gradient. Defaults to the scene-level titleGradient setting."),
});

export const ListRevealTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("list-reveal"),
  rows: z
    .array(
      z.object({
        text: z.string(),
        iconName: z.string().optional().describe("Optional Tabler icon name for the row bullet"),
        revealAtFrame: z.number().int().min(0).describe("Frame (relative to scene start) when this row appears"),
      }),
    )
    .min(1)
    .max(5),
  position: PositionSchema.default({ x: 0.5, y: 0.5 }),
  direction: z
    .enum(["horizontal", "vertical", "auto"])
    .default("auto")
    .describe(
      "'auto' picks horizontal columns for landscape canvases, vertical rows for portrait. Override per-track if needed.",
    ),
});

export const FlowTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("flow"),
  nodes: z
    .array(
      z.object({
        iconName: z.string().describe("Tabler icon name, e.g. IconShield"),
        label: z.string(),
      }),
    )
    .min(2)
    .max(5),
  position: PositionSchema.default({ x: 0.5, y: 0.55 }),
  direction: z
    .enum(["horizontal", "vertical", "auto"])
    .default("auto")
    .describe("'auto' picks vertical for portrait canvases, horizontal for landscape."),
  revealCadenceFrames: z
    .number()
    .int()
    .min(8)
    .default(35)
    .describe("Frames between successive nodes appearing. Arrows draw between them midway."),
});

export const ComparisonTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("comparison"),
  left: z.object({
    iconName: z.string(),
    label: z.string(),
    subLabel: z.string().optional(),
  }),
  right: z.object({
    iconName: z.string(),
    label: z.string(),
    subLabel: z.string().optional(),
  }),
  divider: z
    .object({
      label: z.string().default("vs"),
      showLine: z.boolean().default(true),
    })
    .default({}),
  position: PositionSchema.default({ x: 0.5, y: 0.55 }),
  revealCadenceFrames: z.number().int().min(8).default(25),
  direction: z
    .enum(["horizontal", "vertical", "auto"])
    .default("auto")
    .describe(
      "'auto' picks vertical (stacked top/bottom) for portrait canvases, horizontal (side-by-side) for landscape.",
    ),
});

export const HubTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("hub"),
  center: z.object({
    iconName: z.string(),
    label: z.string(),
  }),
  satellites: z
    .array(
      z.object({
        iconName: z.string(),
        label: z.string(),
      }),
    )
    .min(2)
    .max(4),
  position: PositionSchema.default({ x: 0.5, y: 0.55 }),
  revealCadenceFrames: z.number().int().min(8).default(22),
});

export const LottieTrackSchema = BaseTrackSchema.extend({
  kind: z.literal("lottie"),
  source: z.string().describe("Local path or URL to the .json Lottie file"),
  position: PositionSchema,
  sizePx: z.number().int().positive().default(400),
  loop: z.boolean().default(false),
  playbackRate: z.number().positive().default(1),
});

export const TrackSchema = z.discriminatedUnion("kind", [
  IconTrackSchema,
  TextTrackSchema,
  TitleOverlayTrackSchema,
  ListRevealTrackSchema,
  FlowTrackSchema,
  ComparisonTrackSchema,
  HubTrackSchema,
  LottieTrackSchema,
]);

export const MIN_DURATION_SECONDS = 4;
export const MAX_DURATION_SECONDS = 6;

export const SceneSpecSchema = z
  .object({
    id: z.string().describe("Scene slug, e.g. 'r1-beat-3-three-capabilities'"),
    durationFrames: z.number().int().positive(),
    fps: z.number().int().positive().default(FPS),
    width: z.number().int().positive().default(WIDTH),
    height: z.number().int().positive().default(HEIGHT),
    theme: z
      .enum(["light", "dark"])
      .default("light")
      .describe("Color palette. 'light' is the default Wednesday Solutions palette; 'dark' is the inverse."),
    background: z
      .string()
      .optional()
      .describe(
        "CSS color or 'transparent'. If omitted, uses the theme's background. Set 'transparent' to render with alpha channel.",
      ),
    backgroundImage: z
      .object({
        source: z
          .string()
          .describe("URL (https://...) or path relative to public/. The image is rendered behind all tracks."),
        opacity: z.number().min(0).max(1).default(1),
        fit: z.enum(["cover", "contain"]).default("cover"),
        tint: z.string().optional().describe("CSS color overlay drawn on top of the image (e.g. for darkening)."),
        tintOpacity: z.number().min(0).max(1).default(0),
      })
      .optional()
      .describe("Optional background image. Renders behind the solid background color."),
    palette: z
      .object({
        background: z.string().optional(),
        ink: z.string().optional(),
        inkMuted: z.string().optional(),
        inkDim: z.string().optional(),
        accent: z.string().optional(),
        accentDeep: z.string().optional(),
        hairline: z.string().optional(),
        bloom: z.string().optional(),
        sunset: z.string().optional(),
      })
      .optional()
      .describe("Optional palette overrides. Merges over the selected theme; any unset key falls back to the theme."),
    bloom: z
      .boolean()
      .default(false)
      .describe("Render the theme's ambient bloom gradient behind tracks. Default false (flat canvas — Wednesday reel canon). Set true to enable bloom."),
    titleGradient: z
      .boolean()
      .default(false)
      .describe("Render title-overlay text in the theme's sunset gradient. Default false (solid ink color — Wednesday reel canon). Set true for gradient title."),
    tracks: z.array(TrackSchema),
  })
  .refine(
    (s) => {
      const seconds = s.durationFrames / s.fps;
      return seconds >= MIN_DURATION_SECONDS && seconds <= MAX_DURATION_SECONDS;
    },
    {
      message: `Scene duration must be between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds (durationFrames / fps).`,
      path: ["durationFrames"],
    },
  );

export type SceneSpec = z.infer<typeof SceneSpecSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type IconTrack = z.infer<typeof IconTrackSchema>;
export type TextTrack = z.infer<typeof TextTrackSchema>;
export type TitleOverlayTrack = z.infer<typeof TitleOverlayTrackSchema>;
export type ListRevealTrack = z.infer<typeof ListRevealTrackSchema>;
export type FlowTrack = z.infer<typeof FlowTrackSchema>;
export type ComparisonTrack = z.infer<typeof ComparisonTrackSchema>;
export type HubTrack = z.infer<typeof HubTrackSchema>;
export type LottieTrack = z.infer<typeof LottieTrackSchema>;
