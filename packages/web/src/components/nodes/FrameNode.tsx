import React, { useState, memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FrameNode, UIElement } from "@ludusgraph/core";
import { useCanvasStore } from "../../store/canvasStore.js";
import { Monitor, Maximize2, Tag, Info, Check, X, Edit3 } from "lucide-react";

export const FrameNodeComponent: React.FC<NodeProps> = ({ id, data, selected }) => {
  const frame = data.frame as FrameNode;
  const updateElementInfo = useCanvasStore((s) => s.updateElementInfo);

  const [activeElement, setActiveElement] = useState<UIElement | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  if (!frame) return null;
  const { name, world_transform, root_element } = frame;

  const handleSelectElement = (e: React.MouseEvent, el: UIElement) => {
    e.stopPropagation();
    setActiveElement(el);
    setEditName(el.name || "");
    setEditDescription(el.description || "");
  };

  const handleSaveElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeElement) return;
    updateElementInfo(frame.id, activeElement.id, editName, editDescription);
    setActiveElement({ ...activeElement, name: editName, description: editDescription });
  };

  // Render đệ quy các phần tử giao diện con bên trong khung
  const renderElement = (el: UIElement) => {
    const isButton = el.type === "button";
    const isSelected = activeElement?.id === el.id;

    const style: React.CSSProperties = {
      position: "relative",
      backgroundColor: el.visual?.bg_color || (isButton ? "#2563eb" : "transparent"),
      color: el.visual?.text_content ? "#ffffff" : "inherit",
      borderRadius: `${el.visual?.corner_radius || (isButton ? 6 : 0)}px`,
      border: isSelected
        ? "2px solid #00f2fe"
        : el.visual?.border_width
        ? `${el.visual.border_width}px solid ${el.visual.border_color || "#3b82f6"}`
        : "1px dashed rgba(255,255,255,0.15)",
      fontSize: `${el.visual?.font_size || 14}px`,
      textAlign: el.visual?.text_align || "center",
      padding: isButton ? "8px 18px" : "6px 10px",
      margin: "6px 0",
      cursor: "pointer",
      boxShadow: isSelected
        ? "0 0 15px rgba(0, 242, 254, 0.45)"
        : isButton
        ? "0 4px 12px rgba(0,0,0,0.3)"
        : "none",
      transition: "all 0.15s ease",
      userSelect: "none",
    };

    return (
      <div
        key={el.id}
        className="nodrag"
        style={style}
        onClick={(e) => handleSelectElement(e, el)}
        title={`[${el.name}] ${el.description ? '- ' + el.description : ''}`}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span>{el.visual?.text_content || el.name}</span>
          {el.description && (
            <Info size={12} color="#00f2fe" style={{ opacity: 0.8 }} />
          )}
        </div>

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
            title="Focus Mode"
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

        {/* Blueprint Inspector Modal (Nodrag / Nowheel để gõ văn bản không kéo canvas) */}
        {activeElement && (
          <div
            className="nodrag nowheel"
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              backgroundColor: "rgba(15, 17, 26, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid #3b82f6",
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
              zIndex: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Edit3 size={13} color="#00f2fe" />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#f0f2f8" }}>
                  Đặc tả Bản vẽ: {activeElement.id}
                </span>
              </div>
              <button
                onClick={() => setActiveElement(null)}
                style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveElement}>
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>
                  🏷️ <strong>Tên</strong> (Định nghĩa nó là gì):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    backgroundColor: "#1e2235",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>
                  📝 <strong>Miêu tả chi tiết</strong> (Thông tin bổ trợ chức năng / ý đồ):
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ví dụ: Hiển thị máu 0-100, đổi sang màu đỏ khi dưới 20%..."
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    backgroundColor: "#1e2235",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "11px",
                    resize: "none",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    backgroundColor: "#10b981",
                    border: "none",
                    borderRadius: "6px",
                    color: "#0c0d12",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Check size={12} />
                  <span>Lưu đặc tả</span>
                </button>
              </div>
            </form>
          </div>
        )}
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
          <span>{activeElement ? `Đang chọn: ${activeElement.name}` : "Nhấp vào khối để xem/sửa Tên & Miêu tả"}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(FrameNodeComponent);
