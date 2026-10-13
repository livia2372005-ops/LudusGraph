import React, { useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from "@xyflow/react";
import { useCanvasStore } from "../../store/canvasStore.js";
import { FrameNodeComponent } from "../nodes/FrameNode.js";
import { FlowWireEdgeComponent } from "../edges/FlowWireEdge.js";
import type { WireTrigger, WireAction, WireAnimationHint } from "@ludusgraph/core";
import {
  Plus,
  Download,
  Radio,
  Sparkles,
  Play,
  Square as StopSquare,
  ArrowLeft,
  Square,
  Type,
  Image as ImageIcon,
  Box,
  Layers,
  Zap,
  Check,
  X,
  Smartphone,
  Monitor,
} from "lucide-react";

export const MacroCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addFrame,
    selectedFrameId,
    addElementToFrame,
    isPlaying,
    activePlayFrameId,
    setPlaying,
    backPlay,
    playHistory,
    pendingWire,
    setPendingWire,
    confirmPendingWire,
  } = useCanvasStore();

  const nodeTypes = useMemo(() => ({ frameNode: FrameNodeComponent }), []);
  const edgeTypes = useMemo(() => ({ flowWire: FlowWireEdgeComponent }), []);

  // Modal State for Wire Configuration
  const [wireTrigger, setWireTrigger] = useState<WireTrigger>("on_click");
  const [wireAction, setWireAction] = useState<WireAction>("navigate_replace");
  const [wireAnim, setWireAnim] = useState<WireAnimationHint>("fade");
  const [wireNodeName, setWireNodeName] = useState("Tương tác Nút");

  const handleExportGUIR = () => {
    const jsonStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout_spec.guir.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateWire = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPendingWire({
      trigger: wireTrigger,
      action: wireAction,
      animation_hint: wireAnim,
      sourceNodeName: wireNodeName,
    });
  };

  const activePlayFrame = nodes.find((n) => n.id === activePlayFrameId)?.data.frame as any;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Top Floating Glass Header */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "24px",
          right: "24px",
          height: "60px",
          zIndex: 10,
          backgroundColor: isPlaying ? "rgba(10, 12, 18, 0.9)" : "rgba(18, 20, 30, 0.8)",
          backdropFilter: "blur(14px)",
          border: isPlaying ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid rgba(48, 54, 78, 0.6)",
          borderRadius: "14px",
          boxShadow: isPlaying
            ? "0 10px 35px rgba(16, 185, 129, 0.25)"
            : "0 10px 30px rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: isPlaying
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isPlaying
                ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                : "0 4px 12px rgba(0, 242, 254, 0.35)",
            }}
          >
            {isPlaying ? <Play size={18} fill="#0c0d12" color="#0c0d12" /> : <Sparkles size={18} color="#0c0d12" />}
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              LudusGraph{" "}
              <span style={{ fontSize: "11px", color: isPlaying ? "#10b981" : "#00f2fe", fontWeight: 500 }}>
                {isPlaying ? "SIMULATION MODE" : "BLUEPRINT v1.0"}
              </span>
            </h1>
            <p style={{ fontSize: "11px", color: "#8b92ad" }}>
              {isPlaying
                ? `Đang chạy thử luồng Statechart: [${activePlayFrame?.name || activePlayFrameId}]`
                : "Agent-Native Game UI Layout & Statechart Platform"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Nút Chạy thử nghiệm / Dừng */}
          {!isPlaying ? (
            <button
              onClick={() => setPlaying(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#0c0d12",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <Play size={14} fill="#0c0d12" />
              <span>▶ Chạy thử nghiệm (Play Test)</span>
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {playHistory.length > 1 && (
                <button
                  onClick={backPlay}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    backgroundColor: "#1e2235",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Quay lại</span>
                </button>
              )}
              <button
                onClick={() => setPlaying(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.35)",
                }}
              >
                <StopSquare size={14} fill="#ffffff" />
                <span>⏹ Dừng chạy thử</span>
              </button>
            </div>
          )}

          {!isPlaying && (
            <>
              <button
                onClick={handleExportGUIR}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  background: "linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#0c0d12",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 242, 254, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <Download size={14} />
                <span>Xuất GUIR JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating Left Component Palette (Bảng linh kiện nhanh) */}
      {!isPlaying && (
        <div
          style={{
            position: "absolute",
            top: "90px",
            left: "24px",
            zIndex: 10,
            backgroundColor: "rgba(18, 20, 30, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(48, 54, 78, 0.6)",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "210px",
          }}
        >
          <div style={{ padding: "0 4px 6px 4px", borderBottom: "1px solid #282c3f" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f3f4f6", display: "flex", alignItems: "center", gap: "6px" }}>
              <Layers size={13} color="#00f2fe" />
              <span>BẢNG LINH KIỆN</span>
            </span>
            <p style={{ fontSize: "10px", color: "#8b92ad", marginTop: "2px" }}>
              Thêm khối vào khung đang chọn
            </p>
          </div>

          {/* Nhóm Khung hình */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Khung màn hình</span>
            <button
              onClick={() => addFrame("Màn hình Ngang (16:9)", 640, 360)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: "#161925",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Monitor size={13} color="#00f2fe" />
              <span>Khung Ngang (16:9)</span>
            </button>
            <button
              onClick={() => addFrame("Màn hình Dọc (9:16)", 360, 640)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: "#161925",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Smartphone size={13} color="#9d4edd" />
              <span>Khung Dọc (9:16)</span>
            </button>
          </div>

          {/* Nhóm Phần tử UI */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
              Phần tử UI {selectedFrameId ? `(${selectedFrameId})` : ""}
            </span>
            <button
              disabled={!selectedFrameId}
              onClick={() => selectedFrameId && addElementToFrame(selectedFrameId, "button", "Nút hành động", "Nút bấm thực thi lệnh")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: selectedFrameId ? "#161925" : "#11131c",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: selectedFrameId ? "#e2e8f0" : "#4b5563",
                fontSize: "12px",
                cursor: selectedFrameId ? "pointer" : "not-allowed",
                textAlign: "left",
              }}
            >
              <Square size={13} color="#2563eb" />
              <span>+ Nút bấm (Button)</span>
            </button>
            <button
              disabled={!selectedFrameId}
              onClick={() => selectedFrameId && addElementToFrame(selectedFrameId, "label", "Tiêu đề mới", "Văn bản hiển thị")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: selectedFrameId ? "#161925" : "#11131c",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: selectedFrameId ? "#e2e8f0" : "#4b5563",
                fontSize: "12px",
                cursor: selectedFrameId ? "pointer" : "not-allowed",
                textAlign: "left",
              }}
            >
              <Type size={13} color="#10b981" />
              <span>+ Nhãn chữ (Label)</span>
            </button>
            <button
              disabled={!selectedFrameId}
              onClick={() => selectedFrameId && addElementToFrame(selectedFrameId, "image_placeholder", "Vùng ảnh đại diện", "Khung chứa ảnh")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: selectedFrameId ? "#161925" : "#11131c",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: selectedFrameId ? "#e2e8f0" : "#4b5563",
                fontSize: "12px",
                cursor: selectedFrameId ? "pointer" : "not-allowed",
                textAlign: "left",
              }}
            >
              <ImageIcon size={13} color="#f59e0b" />
              <span>+ Khung ảnh (Image)</span>
            </button>
            <button
              disabled={!selectedFrameId}
              onClick={() => selectedFrameId && addElementToFrame(selectedFrameId, "container", "Hộp chứa con", "Nhóm các khối con")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: selectedFrameId ? "#161925" : "#11131c",
                border: "1px solid #2d334a",
                borderRadius: "6px",
                color: selectedFrameId ? "#e2e8f0" : "#4b5563",
                fontSize: "12px",
                cursor: selectedFrameId ? "pointer" : "not-allowed",
                textAlign: "left",
              }}
            >
              <Box size={13} color="#a855f7" />
              <span>+ Hộp chứa (Box)</span>
            </button>
          </div>
        </div>
      )}

      {/* Semantic Wiring Configuration Modal */}
      {pendingWire && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPendingWire(null)}
        >
          <div
            style={{
              backgroundColor: "#161824",
              border: "1px solid #3b82f6",
              borderRadius: "14px",
              padding: "20px",
              width: "380px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} color="#00f2fe" />
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
                  Thiết lập Dây nối Statechart
                </h3>
              </div>
              <button
                onClick={() => setPendingWire(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "14px" }}>
              Liên kết từ <strong style={{ color: "#38bdf8" }}>{pendingWire.source}</strong> sang{" "}
              <strong style={{ color: "#10b981" }}>{pendingWire.target}</strong>
            </p>

            <form onSubmit={handleCreateWire}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>
                  Tên nhãn tương tác:
                </label>
                <input
                  type="text"
                  value={wireNodeName}
                  onChange={(e) => setWireNodeName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#1f2333",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>
                  Sự kiện kích hoạt (Trigger):
                </label>
                <select
                  value={wireTrigger}
                  onChange={(e) => setWireTrigger(e.target.value as WireTrigger)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#1f2333",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                >
                  <option value="on_click">on_click (Nhấn chuột)</option>
                  <option value="on_hover">on_hover (Rê chuột)</option>
                  <option value="on_timeout">on_timeout (Đếm ngược xong)</option>
                  <option value="on_condition_met">on_condition_met (Thỏa điều kiện)</option>
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>
                  Hành vi chuyển đổi (Action):
                </label>
                <select
                  value={wireAction}
                  onChange={(e) => setWireAction(e.target.value as WireAction)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#1f2333",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                >
                  <option value="navigate_replace">navigate_replace (Thay thế màn hình)</option>
                  <option value="push_popup">push_popup (Mở bảng pop-up nổi)</option>
                  <option value="pop_screen">pop_screen (Đóng màn hình / Quay lại)</option>
                  <option value="toggle_overlay">toggle_overlay (Bật/Tắt lớp phủ)</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>
                  Hiệu ứng diễn hoạt (Animation Hint):
                </label>
                <select
                  value={wireAnim}
                  onChange={(e) => setWireAnim(e.target.value as WireAnimationHint)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#1f2333",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                >
                  <option value="fade">fade (Làm mờ chuyển tiếp)</option>
                  <option value="slide_left">slide_left (Trượt từ phải sang trái)</option>
                  <option value="slide_up">slide_up (Trượt từ dưới lên)</option>
                  <option value="instant">instant (Tức thì không hiệu ứng)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPendingWire(null)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "transparent",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    backgroundColor: "#00f2fe",
                    border: "none",
                    borderRadius: "6px",
                    color: "#0c0d12",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Check size={14} />
                  <span>Tạo Dây Nối</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Infinite Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4.0}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      >
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor="#00f2fe"
          maskColor="rgba(12, 13, 18, 0.85)"
          style={{
            backgroundColor: "#14161f",
            border: "1px solid #262a3d",
            borderRadius: "8px",
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#22263a"
        />
      </ReactFlow>
    </div>
  );
};
