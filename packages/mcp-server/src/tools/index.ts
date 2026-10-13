import {
  type GUIRDocument,
  type FrameNode,
  type FlowWire,
  type UIElement,
  FrameNodeSchema,
  FlowWireSchema,
  validateGUIRDocument,
} from "@ludusgraph/core";
import {
  createSelfHealingError,
  KNOWN_ANCHOR_PRESETS,
  KNOWN_UI_ELEMENT_TYPES,
  KNOWN_WIRE_TRIGGERS,
  KNOWN_WIRE_ACTIONS,
} from "../errors/self-healing.js";

// Bộ nhớ tài liệu mẫu trong runtime MCP (được đồng bộ với DocumentStore khi kết nối sync server)
export let inMemoryGUIRDocument: GUIRDocument = {
  version: "1.0.0",
  project_meta: {
    project_name: "Sample Roguelike Project",
    target_aspect_ratio: "16:9",
    base_resolution: { width: 1920, height: 1080 },
  },
  frames: [
    {
      id: "frm_title",
      name: "Title Screen",
      world_transform: { x: 0, y: 0, width: 1920, height: 1080 },
      root_element: {
        id: "cnt_root_title",
        name: "RootContainer",
        type: "container",
        layout: {
          anchor_preset: "full_rect",
          offsets: { left: 0, top: 0, right: 0, bottom: 0 },
        },
        visual: { bg_color: "#1A1A24" },
        semantics: { role: "screen_root", intent: "contain_title_ui" },
        children: [
          {
            id: "btn_start",
            name: "StartGameButton",
            type: "button",
            layout: {
              anchor_preset: "center",
              offsets: { left: -140, top: -30, right: 140, bottom: 30 },
            },
            visual: {
              bg_color: "#2ECC71",
              border_color: "#27AE60",
              border_width: 2,
              corner_radius: 8,
              text_content: "START GAME",
              font_size: 20,
              text_align: "center",
            },
            semantics: {
              role: "cta_button",
              intent: "start_game",
              tags: ["menu", "start"],
            },
            children: [],
          },
        ],
      },
    },
    {
      id: "frm_char_select",
      name: "Character Select",
      world_transform: { x: 2200, y: 0, width: 1920, height: 1080 },
      root_element: {
        id: "cnt_root_char",
        name: "RootContainer",
        type: "container",
        layout: {
          anchor_preset: "full_rect",
          offsets: { left: 0, top: 0, right: 0, bottom: 0 },
        },
        visual: { bg_color: "#16161E" },
        semantics: { role: "screen_root", intent: "contain_char_select_ui" },
        children: [],
      },
    },
  ],
  wires: [
    {
      id: "wire_title_to_char",
      source_frame_id: "frm_title",
      source_node_id: "btn_start",
      target_frame_id: "frm_char_select",
      transition: {
        trigger: "on_click",
        action: "navigate_replace",
        animation_hint: "fade",
      },
    },
  ],
};

export const toolsDefinition = [
  {
    name: "canvas_get_overview",
    description: "Lấy tổng quan metadata của tất cả các Frames và Wires trên Canvas (tối ưu token, không kèm chi tiết node con).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "frame_get_details",
    description: "Lấy toàn bộ cây Scene Graph và thông tin chi tiết của duy nhất một khung hình (Frame).",
    inputSchema: {
      type: "object",
      required: ["frame_id"],
      properties: {
        frame_id: { type: "string", description: "ID của khung hình cần lấy" },
      },
    },
  },
  {
    name: "frame_create",
    description: "Tạo một Khung hình (Frame) mới trên không gian làm việc vô tận.",
    inputSchema: {
      type: "object",
      required: ["name", "world_x", "world_y"],
      properties: {
        name: { type: "string" },
        world_x: { type: "number" },
        world_y: { type: "number" },
        aspect_ratio: { type: "string", enum: ["16:9", "9:16", "4:3", "custom"], default: "16:9" },
        width: { type: "number", default: 1920 },
        height: { type: "number", default: 1080 },
      },
    },
  },
  {
    name: "frame_batch_mutate",
    description: "Thực hiện giao dịch nguyên tử gồm nhiều thao tác (add, update, delete, move) các phần tử UI bên trong Frame.",
    inputSchema: {
      type: "object",
      required: ["frame_id", "operations"],
      properties: {
        frame_id: { type: "string" },
        operations: {
          type: "array",
          items: {
            type: "object",
            required: ["op"],
            properties: {
              op: { type: "string", enum: ["add", "update", "delete", "move"] },
              parent_id: { type: "string" },
              element_id: { type: "string" },
              element: { type: "object" },
              properties: { type: "object" },
            },
          },
        },
      },
    },
  },
  {
    name: "flow_wire_connect",
    description: "Tạo một dây nối chuyển trạng thái Statechart giữa tương tác của một node với khung đích.",
    inputSchema: {
      type: "object",
      required: ["source_frame_id", "source_node_id", "target_frame_id", "transition"],
      properties: {
        wire_id: { type: "string" },
        source_frame_id: { type: "string" },
        source_node_id: { type: "string" },
        target_frame_id: { type: "string" },
        transition: {
          type: "object",
          required: ["trigger", "action"],
          properties: {
            trigger: { type: "string", enum: KNOWN_WIRE_TRIGGERS },
            guard: { type: "string" },
            action: { type: "string", enum: KNOWN_WIRE_ACTIONS },
            animation_hint: { type: "string", enum: ["instant", "fade", "slide_left", "slide_up"], default: "fade" },
          },
        },
      },
    },
  },
  {
    name: "flow_wire_disconnect",
    description: "Xóa một dây nối luồng bằng wire_id.",
    inputSchema: {
      type: "object",
      required: ["wire_id"],
      properties: {
        wire_id: { type: "string" },
      },
    },
  },
  {
    name: "canvas_export_guir",
    description: "Xuất toàn bộ bản vẽ ra định dạng JSON GUIR chuẩn và bản tóm tắt Markdown cho AI.",
    inputSchema: {
      type: "object",
      properties: {
        include_markdown_summary: { type: "boolean", default: true },
      },
    },
  },
];

export async function handleToolCall(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "canvas_get_overview": {
      return {
        total_frames: inMemoryGUIRDocument.frames.length,
        frames: inMemoryGUIRDocument.frames.map((f) => ({
          id: f.id,
          name: f.name,
          world_x: f.world_transform.x,
          world_y: f.world_transform.y,
          width: f.world_transform.width,
          height: f.world_transform.height,
        })),
        wires: inMemoryGUIRDocument.wires.map((w) => ({
          id: w.id,
          from: { frame_id: w.source_frame_id, node_id: w.source_node_id },
          to: { frame_id: w.target_frame_id },
          trigger: w.transition.trigger,
          action: w.transition.action,
        })),
      };
    }

    case "frame_get_details": {
      const frameId = args.frame_id as string;
      const frame = inMemoryGUIRDocument.frames.find((f) => f.id === frameId);
      if (!frame) {
        return createSelfHealingError(
          "FRAME_NOT_FOUND",
          `Khung hình với ID '${frameId}' không tồn tại trên canvas.`,
          "Hãy gọi 'canvas_get_overview' để kiểm tra danh sách frame_id hợp lệ hiện có.",
          frameId,
          inMemoryGUIRDocument.frames.map((f) => f.id)
        );
      }
      return frame;
    }

    case "frame_create": {
      const frameName = (args.name as string) || "New Frame";
      const frameId = `frm_${Date.now()}`;
      const newFrame: FrameNode = {
        id: frameId,
        name: frameName,
        world_transform: {
          x: Number(args.world_x) || 0,
          y: Number(args.world_y) || 0,
          width: Number(args.width) || 1920,
          height: Number(args.height) || 1080,
        },
        root_element: {
          id: `cnt_root_${frameId}`,
          name: "RootContainer",
          type: "container",
          layout: {
            anchor_preset: "full_rect",
            offsets: { left: 0, top: 0, right: 0, bottom: 0 },
          },
          visual: { bg_color: "#181820" },
          semantics: { role: "screen_root", intent: "root_container" },
          children: [],
        },
      };

      inMemoryGUIRDocument.frames.push(newFrame);
      return { success: true, frame_id: frameId, message: `Đã tạo thành công khung '${frameName}'` };
    }

    case "frame_batch_mutate": {
      const frameId = args.frame_id as string;
      const frame = inMemoryGUIRDocument.frames.find((f) => f.id === frameId);
      if (!frame) {
        return createSelfHealingError(
          "FRAME_NOT_FOUND",
          `Không tìm thấy khung '${frameId}' để thực hiện batch mutate.`,
          "Vui lòng xác nhận lại frame_id hợp lệ qua 'canvas_get_overview'.",
          frameId
        );
      }

      const ops = (args.operations as any[]) || [];
      let appliedCount = 0;

      for (const op of ops) {
        if (op.op === "add") {
          const newEl = op.element as UIElement;
          if (newEl && newEl.layout && !KNOWN_ANCHOR_PRESETS.includes(newEl.layout.anchor_preset)) {
            return createSelfHealingError(
              "INVALID_LAYOUT_PROPERTY",
              `Giá trị anchor_preset '${newEl.layout.anchor_preset}' không hợp lệ tại node '${newEl.id}'.`,
              "Vui lòng chọn một trong các preset hợp lệ.",
              newEl.layout.anchor_preset,
              KNOWN_ANCHOR_PRESETS
            );
          }
          frame.root_element.children = frame.root_element.children || [];
          frame.root_element.children.push(newEl);
          appliedCount++;
        }
      }

      return {
        success: true,
        applied_ops: appliedCount,
        frame_id: frameId,
        total_children: frame.root_element.children?.length ?? 0,
      };
    }

    case "flow_wire_connect": {
      const wireId = (args.wire_id as string) || `wire_${Date.now()}`;
      const newWire: FlowWire = {
        id: wireId,
        source_frame_id: args.source_frame_id as string,
        source_node_id: args.source_node_id as string,
        target_frame_id: args.target_frame_id as string,
        transition: args.transition as any,
      };

      inMemoryGUIRDocument.wires.push(newWire);
      return { success: true, wire_id: wireId, message: "Đã kết nối dây trạng thái thành công" };
    }

    case "flow_wire_disconnect": {
      const wireId = args.wire_id as string;
      const initialLen = inMemoryGUIRDocument.wires.length;
      inMemoryGUIRDocument.wires = inMemoryGUIRDocument.wires.filter((w) => w.id !== wireId);
      return {
        success: inMemoryGUIRDocument.wires.length < initialLen,
        wire_id: wireId,
      };
    }

    case "canvas_export_guir": {
      const mdSummary = [
        `# LudusGraph Layout Architecture Summary`,
        `Project: ${inMemoryGUIRDocument.project_meta.project_name}`,
        `Aspect Ratio: ${inMemoryGUIRDocument.project_meta.target_aspect_ratio}`,
        `Total Frames: ${inMemoryGUIRDocument.frames.length}`,
        `Total Wires: ${inMemoryGUIRDocument.wires.length}`,
        ...inMemoryGUIRDocument.frames.map((f) => `- Frame: ${f.name} (${f.id}) [${f.world_transform.width}x${f.world_transform.height}]`),
      ].join("\n");

      return {
        json_spec: inMemoryGUIRDocument,
        markdown_summary: mdSummary,
      };
    }

    default:
      throw new Error(`Công cụ không xác định: ${name}`);
  }
}
