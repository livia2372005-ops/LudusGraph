import jsonpatch from "fast-json-patch";
import type { Operation } from "fast-json-patch";

export type PatchOperation = Operation;

/**
 * Áp dụng một chuỗi JSON Patch (RFC 6902) lên một đối tượng tài liệu
 */
export function applyPatches<T extends object>(document: T, patches: PatchOperation[]): { document: T; success: boolean } {
  try {
    const clone = JSON.parse(JSON.stringify(document)) as T;
    const result = jsonpatch.applyPatch(clone, patches, true);
    return {
      document: result.newDocument as T,
      success: true,
    };
  } catch (error) {
    return {
      document,
      success: false,
    };
  }
}

/**
 * So sánh 2 phiên bản tài liệu và sinh ra danh sách JSON Patch tối thiểu
 */
export function generatePatches<T extends object>(beforeDoc: T, afterDoc: T): PatchOperation[] {
  return jsonpatch.compare(beforeDoc, afterDoc);
}
