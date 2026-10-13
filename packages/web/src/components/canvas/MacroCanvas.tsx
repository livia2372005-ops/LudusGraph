import React, { useMemo } from "react";
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
import { Plus, Download, Radio, Sparkles } from "lucide-react";

export const MacroCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addFrame,
  } = useCanvasStore();

  const nodeTypes = useMemo(() => ({ frameNode: FrameNodeComponent }), []);
  const edgeTypes = useMemo(() => ({ flowWire: FlowWireEdgeComponent }), []);

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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Top Floating Glass Header */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "24px",
          right: "24px",
          height: "56px",
          zIndex: 10,
          backgroundColor: "rgba(18, 20, 30, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(48, 54, 78, 0.6)",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 242, 254, 0.35)",
            }}
          >
            <Sparkles size={18} color="#0c0d12" />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              LudusGraph <span style={{ fontSize: "11px", color: "#00f2fe", fontWeight: 500 }}>v1.0.0</span>
            </h1>
            <p style={{ fontSize: "11px", color: "#8b92ad" }}>
              Agent-Native Game UI Layout & Statechart Platform
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#10b981",
              fontWeight: 500,
            }}
          >
            <Radio size={12} className="animate-pulse" />
            <span>MCP Ready (stdio / Streamable HTTP)</span>
          </div>

          <button
            onClick={() => addFrame("New Game Frame (16:9)")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "#1e2235",
              border: "1px solid #323852",
              borderRadius: "8px",
              color: "#f3f4f6",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Plus size={15} color="#00f2fe" />
            <span>Thêm Khung (Frame)</span>
          </button>

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
        </div>
      </div>

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
