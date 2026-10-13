import { create } from "zustand";
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, Connection } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import type { FrameNode, FlowWire } from "@ludusgraph/core";

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
}

const initialFrames: FrameNode[] = [
  {
    id: "frm_title",
    name: "Title Screen (16:9)",
    world_transform: { x: 100, y: 100, width: 640, height: 360 }, // Scaled down for canvas display preview
    root_element: {
      id: "cnt_root_title",
      name: "RootContainer",
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
          name: "GameTitleLabel",
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
          name: "StartGameButton",
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
            text_content: "START GAME",
            font_size: 14,
            text_align: "center",
          },
          semantics: { role: "cta_button", intent: "start_game" },
          children: [],
        },
        {
          id: "btn_settings",
          name: "SettingsButton",
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
            text_content: "SETTINGS",
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
      name: "RootContainer",
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
          name: "SelectCharacterLabel",
          type: "label",
          layout: {
            anchor_preset: "center_top",
            offsets: { left: -140, top: 30, right: 140, bottom: 70 },
          },
          visual: {
            text_content: "SELECT HERO",
            font_size: 20,
            text_align: "center",
          },
          semantics: { role: "header_label", intent: "display_select_hero" },
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
      sourceNodeName: "StartGameButton",
    },
    animated: true,
  },
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedFrameId: null,

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
    const newEdge: Edge = {
      ...connection,
      id: `wire_${Date.now()}`,
      type: "flowWire",
      animated: true,
      data: {
        trigger: "on_click",
        action: "navigate_replace",
      },
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },

  setSelectedFrameId: (id) => set({ selectedFrameId: id }),

  addFrame: (name, width = 640, height = 360) => {
    const newId = `frm_${Date.now()}`;
    const newFrame: FrameNode = {
      id: newId,
      name,
      world_transform: { x: 300, y: 300, width, height },
      root_element: {
        id: `cnt_root_${newId}`,
        name: "RootContainer",
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
      position: { x: 300, y: 300 },
      data: { frame: newFrame },
    };

    set({ nodes: [...get().nodes, newNode] });
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
      },
    }));

    set({ nodes, edges });
  },
}));
