import { create } from "zustand";
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, Connection } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import type {
  FrameNode,
  FlowWire,
  UIElementType,
  UIElement,
  WireTrigger,
  WireAction,
  WireAnimationHint,
} from "@ludusgraph/core";

export interface PendingWireConnection {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedFrameId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedFrameId: (id: string | null) => void;
  addFrame: (name: string, width?: number, height?: number) => void;
  loadDocument: (doc: { frames: FrameNode[]; wires: FlowWire[] }) => void;
  updateElementInfo: (frameId: string, elementId: string, name: string, description: string) => void;
  addElementToFrame: (frameId: string, type: UIElementType, name?: string, description?: string) => void;
  deleteElementFromFrame: (frameId: string, elementId: string) => void;

  // Play Mode (Mô phỏng Luồng Trực tiếp)
  isPlaying: boolean;
  activePlayFrameId: string | null;
  playHistory: string[];
  setPlaying: (playing: boolean) => void;
  navigatePlay: (targetFrameId: string) => void;
  backPlay: () => void;

  // Semantic Wiring Modal State
  pendingWire: PendingWireConnection | null;
  setPendingWire: (wire: PendingWireConnection | null) => void;
  confirmPendingWire: (transition: {
    trigger: WireTrigger;
    action: WireAction;
    animation_hint: WireAnimationHint;
    sourceNodeName?: string;
  }) => void;
}

const initialFrames: FrameNode[] = [
  {
    id: "frm_title",
    name: "Title Screen (16:9)",
    world_transform: { x: 100, y: 100, width: 640, height: 360 },
    root_element: {
      id: "cnt_root_title",
      name: "Khung gốc màn hình Title",
      description: "Hộp chứa bao trọn toàn bộ màn hình Title, nền tối màu phong cách Dungeon",
      type: "container",
      layout: {
        anchor_preset: "full_rect",
        offsets: { left: 0, top: 0, right: 0, bottom: 0 },
      },
      visual: { bg_color: "#161722" },
      semantics: { role: "screen_root", intent: "contain_title_ui" },
      children: [
        {
          id: "lbl_game_title",
          name: "Tiêu đề trò chơi (Game Title)",
          description: "Hiển thị tên game nổi bật ở góc trên, căn giữa. Phông chữ lớn, viền vàng kim, có hiệu ứng phát sáng nhẹ.",
          type: "label",
          layout: {
            anchor_preset: "center_top",
            offsets: { left: -160, top: 40, right: 160, bottom: 80 },
          },
          visual: {
            text_content: "DUNGEON OF LUDUS",
            font_size: 24,
            bg_color: "transparent",
            text_align: "center",
          },
          semantics: { role: "header_label", intent: "display_game_title" },
          children: [],
        },
        {
          id: "btn_start",
          name: "Nút Bắt đầu chơi (Start Button)",
          description: "Nút bấm hành động chính (CTA) ở trung tâm. Nhấn vào sẽ kích hoạt dây nối chuyển sang màn hình Chọn nhân vật.",
          type: "button",
          layout: {
            anchor_preset: "center",
            offsets: { left: -100, top: 0, right: 100, bottom: 44 },
          },
          visual: {
            bg_color: "#10b981",
            border_color: "#059669",
            border_width: 2,
            corner_radius: 8,
            text_content: "BẮT ĐẦU CHƠI",
            font_size: 14,
            text_align: "center",
          },
          semantics: { role: "cta_button", intent: "start_game" },
          children: [],
        },
        {
          id: "btn_settings",
          name: "Nút Cài đặt (Settings Button)",
          description: "Nút mở popup cài đặt âm thanh, hình ảnh và điều khiển. Nằm dưới nút Bắt đầu.",
          type: "button",
          layout: {
            anchor_preset: "center",
            offsets: { left: -100, top: 60, right: 100, bottom: 100 },
          },
          visual: {
            bg_color: "#374151",
            border_color: "#4b5563",
            border_width: 1,
            corner_radius: 8,
            text_content: "CÀI ĐẶT",
            font_size: 13,
            text_align: "center",
          },
          semantics: { role: "nav_button", intent: "open_settings" },
          children: [],
        },
      ],
    },
  },
  {
    id: "frm_char_select",
    name: "Character Select (16:9)",
    world_transform: { x: 880, y: 100, width: 640, height: 360 },
    root_element: {
      id: "cnt_root_char",
      name: "Khung gốc Chọn nhân vật",
      description: "Màn hình lựa chọn lớp nhân vật trước khi bước vào hầm ngục",
      type: "container",
      layout: {
        anchor_preset: "full_rect",
        offsets: { left: 0, top: 0, right: 0, bottom: 0 },
      },
      visual: { bg_color: "#13141f" },
      semantics: { role: "screen_root", intent: "contain_char_select_ui" },
      children: [
        {
          id: "lbl_char_title",
          name: "Tiêu đề Chọn anh hùng",
          description: "Dòng chữ tiêu đề 'CHỌN ANH HÙNG', căn trên, kèm thông tin gợi ý lựa chọn",
          type: "label",
          layout: {
            anchor_preset: "center_top",
            offsets: { left: -140, top: 30, right: 140, bottom: 70 },
          },
          visual: {
            text_content: "CHỌN ANH HÙNG",
            font_size: 20,
            text_align: "center",
          },
          semantics: { role: "header_label", intent: "display_select_hero" },
          children: [],
        },
        {
          id: "btn_back",
          name: "Nút Quay lại màn hình chính",
          description: "Nút bấm trở về màn hình Title ban đầu",
          type: "button",
          layout: {
            anchor_preset: "bottom_left",
            offsets: { left: 20, top: -50, right: 140, bottom: -10 },
          },
          visual: {
            bg_color: "#4b5563",
            border_color: "#6b7280",
            border_width: 1,
            corner_radius: 6,
            text_content: "⬅ QUAY LẠI",
            font_size: 12,
            text_align: "center",
          },
          semantics: { role: "nav_button", intent: "back_to_title" },
          children: [],
        },
      ],
    },
  },
];

const initialNodes: Node[] = initialFrames.map((f) => ({
  id: f.id,
  type: "frameNode",
  position: { x: f.world_transform.x, y: f.world_transform.y },
  data: { frame: f },
}));

const initialEdges: Edge[] = [
  {
    id: "wire_title_to_char",
    source: "frm_title",
    target: "frm_char_select",
    type: "flowWire",
    data: {
      trigger: "on_click",
      action: "navigate_replace",
      sourceNodeName: "Nút Bắt đầu chơi",
    },
    animated: true,
  },
  {
    id: "wire_char_to_title",
    source: "frm_char_select",
    target: "frm_title",
    type: "flowWire",
    data: {
      trigger: "on_click",
      action: "navigate_replace",
      sourceNodeName: "Nút Quay lại",
    },
    animated: true,
  },
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedFrameId: "frm_title",

  // Play mode state
  isPlaying: false,
  activePlayFrameId: "frm_title",
  playHistory: ["frm_title"],

  pendingWire: null,

  setPendingWire: (wire) => set({ pendingWire: wire }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    // Mở Wire modal để người dùng chọn Trigger và Action
    set({
      pendingWire: {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      },
    });
  },

  confirmPendingWire: ({ trigger, action, animation_hint, sourceNodeName }) => {
    const pending = get().pendingWire;
    if (!pending) return;

    const newEdge: Edge = {
      id: `wire_${Date.now()}`,
      source: pending.source,
      target: pending.target,
      type: "flowWire",
      animated: true,
      data: {
        trigger,
        action,
        animation_hint,
        sourceNodeName: sourceNodeName || "Tương tác",
      },
    };

    set({
      edges: addEdge(newEdge, get().edges),
      pendingWire: null,
    });
  },

  setSelectedFrameId: (id) => set({ selectedFrameId: id }),

  addFrame: (name, width = 640, height = 360) => {
    const newId = `frm_${Date.now()}`;
    const newFrame: FrameNode = {
      id: newId,
      name,
      world_transform: { x: 250, y: 250, width, height },
      root_element: {
        id: `cnt_root_${newId}`,
        name: `Khung gốc ${name}`,
        description: `Bao bọc các phần tử của màn hình ${name}`,
        type: "container",
        layout: {
          anchor_preset: "full_rect",
          offsets: { left: 0, top: 0, right: 0, bottom: 0 },
        },
        visual: { bg_color: "#181824" },
        semantics: { role: "screen_root", intent: "root_container" },
        children: [],
      },
    };

    const newNode: Node = {
      id: newId,
      type: "frameNode",
      position: { x: 250, y: 250 },
      data: { frame: newFrame },
    };

    set({ nodes: [...get().nodes, newNode], selectedFrameId: newId });
  },

  loadDocument: (doc) => {
    const nodes = doc.frames.map((f) => ({
      id: f.id,
      type: "frameNode",
      position: { x: f.world_transform.x, y: f.world_transform.y },
      data: { frame: f },
    }));

    const edges = doc.wires.map((w) => ({
      id: w.id,
      source: w.source_frame_id,
      target: w.target_frame_id,
      type: "flowWire",
      animated: true,
      data: {
        trigger: w.transition.trigger,
        action: w.transition.action,
        animation_hint: w.transition.animation_hint,
      },
    }));

    set({ nodes, edges, selectedFrameId: nodes[0]?.id || null });
  },

  updateElementInfo: (frameId, elementId, name, description) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== frameId) return node;
        const frame = JSON.parse(JSON.stringify(node.data.frame)) as FrameNode;
        const updateRecursive = (el: any): any => {
          if (el.id === elementId) {
            return { ...el, name, description };
          }
          if (el.children) {
            el.children = el.children.map(updateRecursive);
          }
          return el;
        };
        frame.root_element = updateRecursive(frame.root_element);
        return {
          ...node,
          data: { ...node.data, frame },
        };
      }),
    });
  },

  addElementToFrame: (frameId, type, customName, customDescription) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== frameId) return node;
        const frame = JSON.parse(JSON.stringify(node.data.frame)) as FrameNode;
        frame.root_element.children = frame.root_element.children || [];

        const elementId = `${type.slice(0, 3)}_${Date.now().toString().slice(-4)}`;
        let newElement: UIElement;

        switch (type) {
          case "button":
            newElement = {
              id: elementId,
              name: customName || "Nút bấm mới",
              description: customDescription || "Nút bấm tương tác người dùng, click để kích hoạt hành động",
              type: "button",
              layout: {
                anchor_preset: "center",
                offsets: { left: -90, top: 0, right: 90, bottom: 40 },
              },
              visual: {
                bg_color: "#2563eb",
                border_color: "#3b82f6",
                border_width: 1,
                corner_radius: 6,
                text_content: customName || "NÚT BẤM",
                font_size: 13,
                text_align: "center",
              },
              semantics: { role: "button", intent: "generic_action" },
              children: [],
            };
            break;

          case "label":
            newElement = {
              id: elementId,
              name: customName || "Nhãn chữ mới",
              description: customDescription || "Dòng văn bản hiển thị tiêu đề hoặc thông số chỉ số",
              type: "label",
              layout: {
                anchor_preset: "center",
                offsets: { left: -100, top: -30, right: 100, bottom: 0 },
              },
              visual: {
                text_content: customName || "VĂN BẢN MỚI",
                font_size: 16,
                text_align: "center",
              },
              semantics: { role: "label", intent: "display_text" },
              children: [],
            };
            break;

          case "image_placeholder":
            newElement = {
              id: elementId,
              name: customName || "Vùng ảnh / Icon",
              description: customDescription || "Khung hình chữ nhật hiển thị sprite hình ảnh hoặc biểu tượng",
              type: "image_placeholder",
              layout: {
                anchor_preset: "center",
                offsets: { left: -50, top: -50, right: 50, bottom: 50 },
              },
              visual: {
                bg_color: "#1e293b",
                border_color: "#475569",
                border_width: 1,
                corner_radius: 8,
                text_content: "🖼️ ẢNH",
                font_size: 12,
                text_align: "center",
              },
              semantics: { role: "image", intent: "display_asset" },
              children: [],
            };
            break;

          default:
            newElement = {
              id: elementId,
              name: customName || "Hộp chứa (Container)",
              description: customDescription || "Vùng nhóm các khối con theo chiều ngang hoặc dọc",
              type: "container",
              layout: {
                anchor_preset: "center",
                offsets: { left: -120, top: -80, right: 120, bottom: 80 },
              },
              visual: {
                bg_color: "rgba(30, 41, 59, 0.4)",
                border_color: "#334155",
                border_width: 1,
                corner_radius: 8,
              },
              semantics: { role: "container", intent: "group_elements" },
              children: [],
            };
        }

        frame.root_element.children.push(newElement);
        return {
          ...node,
          data: { ...node.data, frame },
        };
      }),
    });
  },

  deleteElementFromFrame: (frameId, elementId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== frameId) return node;
        const frame = JSON.parse(JSON.stringify(node.data.frame)) as FrameNode;
        const deleteRecursive = (el: any): any => {
          if (el.children) {
            el.children = el.children.filter((child: any) => child.id !== elementId).map(deleteRecursive);
          }
          return el;
        };
        frame.root_element = deleteRecursive(frame.root_element);
        return {
          ...node,
          data: { ...node.data, frame },
        };
      }),
    });
  },

  // Play Mode Actions
  setPlaying: (playing) => {
    const firstFrameId = get().nodes[0]?.id || null;
    set({
      isPlaying: playing,
      activePlayFrameId: playing ? (get().selectedFrameId || firstFrameId) : null,
      playHistory: playing && firstFrameId ? [firstFrameId] : [],
    });
  },

  navigatePlay: (targetFrameId) => {
    set({
      activePlayFrameId: targetFrameId,
      playHistory: [...get().playHistory, targetFrameId],
    });
  },

  backPlay: () => {
    const history = [...get().playHistory];
    if (history.length > 1) {
      history.pop();
      const prev = history[history.length - 1];
      set({
        activePlayFrameId: prev,
        playHistory: history,
      });
    }
  },
}));
