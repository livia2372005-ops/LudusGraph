import { z } from "zod";
import type { GUIRDocument } from "../types/guir.js";

export const AspectRatioPresetSchema = z.enum(["16:9", "9:16", "4:3", "21:9", "custom"]);

export const UIElementTypeSchema = z.enum([
  "container",
  "button",
  "label",
  "rect",
  "ellipse",
  "image_placeholder",
]);

export const AnchorPresetSchema = z.enum([
  "top_left",
  "top_right",
  "bottom_left",
  "bottom_right",
  "center",
  "center_top",
  "center_bottom",
  "full_rect",
  "h_stretch_top",
  "v_stretch_left",
]);

export const FlexDirectionSchema = z.enum(["none", "horizontal", "vertical"]);
export const TextAlignSchema = z.enum(["left", "center", "right"]);

export const PixelOffsetsSchema = z.object({
  left: z.number().default(0),
  top: z.number().default(0),
  right: z.number().default(0),
  bottom: z.number().default(0),
});

export const UILayoutSchema = z.object({
  anchor_preset: AnchorPresetSchema,
  offsets: PixelOffsetsSchema.default({ left: 0, top: 0, right: 0, bottom: 0 }),
  flex_direction: FlexDirectionSchema.optional().default("none"),
  gap: z.number().nonnegative().optional().default(0),
  padding: z.number().nonnegative().optional().default(0),
});

export const UIVisualSchema = z.object({
  bg_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, "Màu phải là mã Hex #RRGGBB hoặc #RRGGBBAA").optional(),
  border_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, "Màu phải là mã Hex #RRGGBB hoặc #RRGGBBAA").optional(),
  border_width: z.number().nonnegative().optional().default(0),
  corner_radius: z.number().nonnegative().optional().default(0),
  text_content: z.string().optional(),
  font_size: z.number().positive().optional().default(14),
  text_align: TextAlignSchema.optional().default("center"),
  opacity: z.number().min(0).max(1).optional().default(1),
});

export const UISemanticsSchema = z.object({
  role: z.string().min(1, "Role không được để trống"),
  intent: z.string().min(1, "Intent không được để trống"),
  tags: z.array(z.string()).optional().default([]),
  custom_payload: z.record(z.unknown()).optional(),
});

export const UIElementSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().min(1, "ID phần tử không được để trống"),
    name: z.string().min(1, "Tên phần tử không được để trống"),
    description: z.string().optional().default(""), // Miêu tả chi tiết bổ trợ cho tên
    type: UIElementTypeSchema,
    layout: UILayoutSchema,
    visual: UIVisualSchema.optional(),
    semantics: UISemanticsSchema.optional().default({ role: "ui_element", intent: "generic" }),
    children: z.array(UIElementSchema).optional().default([]),
  })
);

export const WorldTransformSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive("Chiều rộng phải > 0"),
  height: z.number().positive("Chiều cao phải > 0"),
});

export const FrameNodeSchema = z.object({
  id: z.string().min(1, "ID khung không được để trống"),
  name: z.string().min(1, "Tên khung không được để trống"),
  world_transform: WorldTransformSchema,
  root_element: UIElementSchema,
});

export const WireTriggerSchema = z.enum(["on_click", "on_hover", "on_timeout", "on_condition_met"]);
export const WireActionSchema = z.enum(["navigate_replace", "push_popup", "pop_screen", "toggle_overlay"]);
export const WireAnimationHintSchema = z.enum(["instant", "fade", "slide_left", "slide_up"]);

export const WireTransitionSchema = z.object({
  trigger: WireTriggerSchema,
  guard: z.string().optional(),
  action: WireActionSchema,
  animation_hint: WireAnimationHintSchema.optional().default("fade"),
});

export const FlowWireSchema = z.object({
  id: z.string().min(1, "ID dây nối không được để trống"),
  source_frame_id: z.string().min(1),
  source_node_id: z.string().min(1),
  target_frame_id: z.string().min(1),
  transition: WireTransitionSchema,
});

export const ProjectMetaSchema = z.object({
  project_name: z.string().min(1),
  target_aspect_ratio: AspectRatioPresetSchema,
  base_resolution: z.object({
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080),
  }),
});

export const GUIRDocumentSchema = z.object({
  version: z.literal("1.0.0"),
  project_meta: ProjectMetaSchema,
  frames: z.array(FrameNodeSchema),
  wires: z.array(FlowWireSchema),
});

export function validateGUIRDocument(data: unknown): { success: true; data: GUIRDocument } | { success: false; errors: z.ZodError } {
  const result = GUIRDocumentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as GUIRDocument };
  }
  return { success: false, errors: result.error };
}
