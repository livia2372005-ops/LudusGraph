/**
 * Game UI Intermediate Representation (GUIR) v1.0.0 TypeScript Type Definitions
 */

export type AspectRatioPreset = "16:9" | "9:16" | "4:3" | "21:9" | "custom";

export type UIElementType =
  | "container"
  | "button"
  | "label"
  | "rect"
  | "ellipse"
  | "image_placeholder";

export type AnchorPreset =
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right"
  | "center"
  | "center_top"
  | "center_bottom"
  | "full_rect"
  | "h_stretch_top"
  | "v_stretch_left";

export type FlexDirection = "none" | "horizontal" | "vertical";

export type TextAlign = "left" | "center" | "right";

export type WireTrigger =
  | "on_click"
  | "on_hover"
  | "on_timeout"
  | "on_condition_met";

export type WireAction =
  | "navigate_replace"
  | "push_popup"
  | "pop_screen"
  | "toggle_overlay";

export type WireAnimationHint =
  | "instant"
  | "fade"
  | "slide_left"
  | "slide_up";

export interface PixelOffsets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface UILayout {
  anchor_preset: AnchorPreset;
  offsets: PixelOffsets;
  flex_direction?: FlexDirection;
  gap?: number;
  padding?: number;
}

export interface UIVisual {
  bg_color?: string;
  border_color?: string;
  border_width?: number;
  corner_radius?: number;
  text_content?: string;
  font_size?: number;
  text_align?: TextAlign;
  opacity?: number;
}

export interface UISemantics {
  role: string;
  intent: string;
  tags?: string[];
  custom_payload?: Record<string, unknown>;
}

export interface UIElement {
  id: string;
  name: string;
  type: UIElementType;
  layout: UILayout;
  visual?: UIVisual;
  semantics: UISemantics;
  children?: UIElement[];
}

export interface WorldTransform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameNode {
  id: string;
  name: string;
  world_transform: WorldTransform;
  root_element: UIElement;
}

export interface WireTransition {
  trigger: WireTrigger;
  guard?: string;
  action: WireAction;
  animation_hint?: WireAnimationHint;
}

export interface FlowWire {
  id: string;
  source_frame_id: string;
  source_node_id: string;
  target_frame_id: string;
  transition: WireTransition;
}

export interface ProjectMeta {
  project_name: string;
  target_aspect_ratio: AspectRatioPreset;
  base_resolution: {
    width: number;
    height: number;
  };
}

export interface GUIRDocument {
  version: "1.0.0";
  project_meta: ProjectMeta;
  frames: FrameNode[];
  wires: FlowWire[];
}
