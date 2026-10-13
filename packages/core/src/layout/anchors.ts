import type { AnchorPreset, PixelOffsets } from "../types/guir.js";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnchorRatios {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Ánh xạ Anchor Preset chuẩn Game Engine sang tỷ lệ [0.0, 1.0] tương ứng
 */
export const ANCHOR_PRESET_MAP: Record<AnchorPreset, AnchorRatios> = {
  top_left: { minX: 0.0, minY: 0.0, maxX: 0.0, maxY: 0.0 },
  top_right: { minX: 1.0, minY: 0.0, maxX: 1.0, maxY: 0.0 },
  bottom_left: { minX: 0.0, minY: 1.0, maxX: 0.0, maxY: 1.0 },
  bottom_right: { minX: 1.0, minY: 1.0, maxX: 1.0, maxY: 1.0 },
  center: { minX: 0.5, minY: 0.5, maxX: 0.5, maxY: 0.5 },
  center_top: { minX: 0.5, minY: 0.0, maxX: 0.5, maxY: 0.0 },
  center_bottom: { minX: 0.5, minY: 1.0, maxX: 0.5, maxY: 1.0 },
  full_rect: { minX: 0.0, minY: 0.0, maxX: 1.0, maxY: 1.0 },
  h_stretch_top: { minX: 0.0, minY: 0.0, maxX: 1.0, maxY: 0.0 },
  v_stretch_left: { minX: 0.0, minY: 0.0, maxX: 0.0, maxY: 1.0 },
};

/**
 * Tính toán hộp bao pixel (x, y, width, height) của phần tử con dựa trên hộp bao cha,
 * anchor preset và các giá trị bù trừ pixel offsets.
 */
export function calculateElementBounds(
  parentBounds: BoundingBox,
  anchorPreset: AnchorPreset,
  offsets: PixelOffsets
): BoundingBox {
  const ratios = ANCHOR_PRESET_MAP[anchorPreset] || ANCHOR_PRESET_MAP.center;

  const left = parentBounds.x + parentBounds.width * ratios.minX + offsets.left;
  const top = parentBounds.y + parentBounds.height * ratios.minY + offsets.top;

  let width: number;
  let height: number;

  if (ratios.minX === ratios.maxX) {
    // Neo điểm (point anchor) - offsets.right và offsets.bottom đóng vai trò kích thước hoặc offset đối xứng
    width = Math.abs(offsets.right - offsets.left) || 120;
  } else {
    // Neo dải (stretch anchor)
    const right = parentBounds.x + parentBounds.width * ratios.maxX - offsets.right;
    width = Math.max(0, right - left);
  }

  if (ratios.minY === ratios.maxY) {
    height = Math.abs(offsets.bottom - offsets.top) || 40;
  } else {
    const bottom = parentBounds.y + parentBounds.height * ratios.maxY - offsets.bottom;
    height = Math.max(0, bottom - top);
  }

  return { x: left, y: top, width, height };
}
