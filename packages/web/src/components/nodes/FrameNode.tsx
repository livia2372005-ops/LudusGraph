import React, { useState, memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FrameNode, UIElement } from "@ludusgraph/core";
import { useCanvasStore } from "../../store/canvasStore.js";
import {
  Monitor,
  Maximize2,
  Tag,
  Info,
  Check,
  X,
  Edit3,
  Plus,
  Trash2,
  Play,
  Type,
  Square,
  Image as ImageIcon,
} from "lucide-react";

export const FrameNodeComponent: React.FC<NodeProps> = ({ id, data, selected }) => {
  const frame = data.frame as FrameNode;
  const {
    updateElementInfo,
    addElementToFrame,
    deleteElementFromFrame,
    isPlaying,
    activePlayFrameId,
    navigatePlay,
    edges,
    setSelectedFrameId,
  } = useCanvasStore();

  const [activeElement, setActiveElement] = useState<UIElement | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!frame) return null;
  const { name, world_transform, root_element } = frame;

  const isCurrentPlayFrame = isPlaying && activePlayFrameId === frame.id;
  const isDimmedInPlay = isPlaying && !isCurrentPlayFrame;

  const handleSelectElement = (e: React.MouseEvent, el: UIElement) => {
    e.stopPropagation();

    // Trong Play Mode: Kích hoạt chuyển cảnh nếu có dây nối
    if (isPlaying) {
      const outgoingWire = edges.find((edge) => edge.source === frame.id);
      if (outgoingWire) {
        navigatePlay(outgoingWire.target);
      }
      return;
    }

    setActiveElement(el);
    setEditName(el.name || "");
    setEditDescription(el.description || "");
    setSelectedFrameId(frame.id);
  };

  const handleSaveElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeElement) return;
    updateElementInfo(frame.id, activeElement.id, editName, editDescription);
    setActiveElement({ ...activeElement, name: editName, description: editDescription });
  };

  const handleDeleteElement = (elementId: string) => {
    deleteElementFromFrame(frame.id, elementId);
    setActiveElement(null);
  };

  // Render các phần tử con
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
      padding: isButton ? "8px 18px" : "6px 12px",
      margin: "6px 0",
      cursor: "pointer",
      boxShadow: isSelected
        ? "0 0 15px rgba(0, 242, 254, 0.45)"
        : isButton
        ? "0 4px 14px rgba(0,0,0,0.35)"
        : "none",
      transition: "all 0.15s ease",
      userSelect: "none",
      transform: isPlaying && isButton ? "scale(1.02)" : "scale(1)",
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
          {!isPlaying && el.description && (
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
        borderRadius: "14px",
        border: isCurrentPlayFrame
          ? "3px solid #10b981"
          : selected
          ? "2px solid #00f2fe"
          : "1px solid #282c3f",
        boxShadow: isCurrentPlayFrame
          ? "0 0 40px rgba(16, 185, 129, 0.6), 0 20px 50px rgba(0,0,0,0.8)"
          : selected
          ? "0 0 25px rgba(0, 242, 254, 0.35), 0 20px 40px rgba(0,0,0,0.6)"
          : "0 10px 30px rgba(0, 0, 0, 0.45)",
        opacity: isDimmedInPlay ? 0.3 : 1,
        filter: isDimmedInPlay ? "grayscale(80%)" : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s ease",
      }}
      onClick={() => setSelectedFrameId(frame.id)}
    >
      {/* Handles kết nối dây nối Statecharts */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          width: "14px",
          height: "14px",
          backgroundColor: "#00f2fe",
          border: "2px solid #0c0d12",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{
          width: "14px",
          height: "14px",
          backgroundColor: "#10b981",
          border: "2px solid #0c0d12",
        }}
      />

      {/* Frame Header Toolbar */}
      <div
        style={{
          padding: "8px 14px",
          backgroundColor: isCurrentPlayFrame ? "rgba(16, 185, 129, 0.15)" : "rgba(20, 22, 31, 0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #282c3f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Monitor size={15} color={isCurrentPlayFrame ? "#10b981" : "#00f2fe"} />
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#f3f4f6" }}>
            {name}
          </span>
          {isCurrentPlayFrame ? (
            <span
              style={{
                fontSize: "10px",
                padding: "2px 8px",
                backgroundColor: "#10b981",
                color: "#0c0d12",
                borderRadius: "4px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Play size={10} fill="#0c0d12" /> ACTIVE SCREEN
            </span>
          ) : (
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
          )}
        </div>

        {!isPlaying && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Nút thêm linh kiện nhanh */}
            <div style={{ position: "relative" }}>
              <button
                className="nodrag"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(!showAddMenu);
                }}
                title="Thêm khối linh kiện vào khung này"
                style={{
                  background: "rgba(0, 242, 254, 0.15)",
                  border: "1px solid rgba(0, 242, 254, 0.3)",
                  borderRadius: "5px",
                  color: "#00f2fe",
                  cursor: "pointer",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                <Plus size={12} />
                <span>Thêm</span>
              </button>

              {/* Add Menu Dropdown */}
              {showAddMenu && (
                <div
                  className="nodrag nowheel"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "6px",
                    backgroundColor: "#161925",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                    zIndex: 30,
                    width: "160px",
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      addElementToFrame(frame.id, "button", "Nút hành động", "Nút bấm thực thi lệnh người dùng");
                      setShowAddMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Square size={13} color="#2563eb" />
                    <span>Nút bấm (Button)</span>
                  </button>
                  <button
                    onClick={() => {
                      addElementToFrame(frame.id, "label", "Tiêu đề mới", "Văn bản hiển thị thông tin");
                      setShowAddMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Type size={13} color="#10b981" />
                    <span>Nhãn chữ (Label)</span>
                  </button>
                  <button
                    onClick={() => {
                      addElementToFrame(frame.id, "image_placeholder", "Vùng ảnh đại diện", "Khung chứa ảnh nhân vật hoặc icon");
                      setShowAddMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <ImageIcon size={13} color="#f59e0b" />
                    <span>Khung ảnh (Image)</span>
                  </button>
                </div>
              )}
            </div>

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
        )}
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

        {/* Blueprint Inspector Modal (Chỉ hiện khi KHÔNG ở Play Mode) */}
        {!isPlaying && activeElement && (
          <div
            className="nodrag nowheel"
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              backgroundColor: "rgba(15, 17, 26, 0.96)",
              backdropFilter: "blur(12px)",
              border: "1px solid #3b82f6",
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleDeleteElement(activeElement.id)}
                  title="Xóa phần tử này"
                  style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setActiveElement(null)}
                  style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", padding: "2px" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveElement}>
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>
                  🏷️ <strong>Tên</strong> (Định nghĩa bản chất nó là gì):
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
          <span>
            {isPlaying
              ? "▶ Chế độ Play Test: Nhấp vào nút để kích hoạt luồng chuyển cảnh"
              : activeElement
              ? `Đang chọn: ${activeElement.name}`
              : "Nhấp vào khối để xem/sửa Tên & Miêu tả"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(FrameNodeComponent);
