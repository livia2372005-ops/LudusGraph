export interface SelfHealingErrorResponse {
  isError: true;
  error_code: string;
  message: string;
  invalid_value?: unknown;
  valid_options?: string[];
  resolution_guidance: string;
}

export function createSelfHealingError(
  errorCode: string,
  message: string,
  resolutionGuidance: string,
  invalidValue?: unknown,
  validOptions?: string[]
): SelfHealingErrorResponse {
  return {
    isError: true,
    error_code: errorCode,
    message,
    invalid_value: invalidValue,
    valid_options: validOptions,
    resolution_guidance: resolutionGuidance,
  };
}

export const KNOWN_ANCHOR_PRESETS = [
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
];

export const KNOWN_UI_ELEMENT_TYPES = [
  "container",
  "button",
  "label",
  "rect",
  "ellipse",
  "image_placeholder",
];

export const KNOWN_WIRE_TRIGGERS = [
  "on_click",
  "on_hover",
  "on_timeout",
  "on_condition_met",
];

export const KNOWN_WIRE_ACTIONS = [
  "navigate_replace",
  "push_popup",
  "pop_screen",
  "toggle_overlay",
];
