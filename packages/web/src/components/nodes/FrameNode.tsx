import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FrameNode, UIElement } from "@ludusgraph/core";
import { Monitor, Maximize2, Tag, Layers } from "lucide-react";

export const FrameNodeComponent: React.FC<NodeProps> = ({ id, data, selected }) => {
  const frame = data.frame as FrameNode;
  if (!frame) return null;

  const { name, world_transform, root_element } = frame;

  // Render đệ quy các phần tử giao diện con bên trong khung
  const renderElement = (el: UIElement) => {
    const isButton = el.type === "button";
    const isLabel = el.type === "label";

    const style: React.CSSProperties = {
      position: "relative",
      backgroundColor: el.visual?.bg_color || (isButton ? "#2563eb" : "transparent"),
      color: el.visual?.text_content ? "#ffffff" : "inherit",
      borderRadius: `${el.visual?.corner_radius || (isButton ? 6 : 0)}px`,
      border: el.visual?.border_width
        ? `${el.visual.border_width}px solid ${el.visual.border_color || "#3b82f6"}`
        : "none",
      fontSize: `${el.visual?.font_size || 14}px`,
      textAlign: el.visual?.text_align || "center",
      padding: isButton ? "6px 14px" : "4px 8px",
      margin: "4px 0",
      cursor: isButton ? "pointer" : "default",
      boxShadow: isButton ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
      transition: "all 0.15s ease",
    };

    return (
      <div key={el.id} className="nodrag" style={style}>
        {el.visual?.text_content || el.name}
        {el.children && el.children.length > 0 && (
          <div style={{ paddingLeft: "8px", marginTop: "4px" }}>
            {el.children.map(renderElement)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${world_transform.width}px`,
        height: `${world_transform.height}px`,
        backgroundColor: root_element.visual?.bg_color || "#151621",
        borderRadius: "12px",
        border: selected ? "2px solid #00f2fe" : "1px solid #282c3f",
        boxShadow: selected
          ? "0 0 25px rgba(0, 242, 254, 0.35), 0 20px 40px rgba(0,0,0,0.6)"
          : "0 10px 30px rgba(0, 0, 0, 0.45)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Handles kết nối dây nối Statecharts */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "#00f2fe",
          border: "2px solid #0c0d12",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "#10b981",
          border: "2px solid #0c0d12",
        }}
      />

      {/* Frame Header Toolbar */}
      <div
        style={{
          padding: "8px 12px",
          backgroundColor: "rgba(20, 22, 31, 0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #282c3f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Monitor size={15} color="#00f2fe" />
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#f3f4f6" }}>
            {name}
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              backgroundColor: "rgba(0, 242, 254, 0.15)",
              color: "#00f2fe",
              borderRadius: "4px",
              fontWeight: 500,
            }}
          >
            16:9
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#6b7280", fontFamily: "var(--font-mono)" }}>
            {world_transform.width}×{world_transform.height}
          </span>
          <button
            title="Focus Mode (Double-click)"
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Micro-Viewport Content Area */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {root_element.children && root_element.children.map(renderElement)}
      </div>

      {/* Frame Footer Semantics Bar */}
      <div
        style={{
          padding: "4px 10px",
          backgroundColor: "rgba(10, 11, 16, 0.7)",
          borderTop: "1px solid #222638",
          fontSize: "11px",
          color: "#6b7280",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Tag size={11} />
          <span>role: {root_element.semantics.role}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Layers size={11} />
          <span>{root_element.children?.length || 0} nodes</span>
        </div>
      </div>
    </div>
  );
};
