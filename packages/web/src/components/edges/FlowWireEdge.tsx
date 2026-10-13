import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { Zap, ArrowRight } from "lucide-react";

export const FlowWireEdgeComponent: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const trigger = (data?.trigger as string) || "on_click";
  const action = (data?.action as string) || "navigate_replace";

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: "#00f2fe",
          strokeWidth: 2.5,
          strokeDasharray: "6 4",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            backgroundColor: "#181a26",
            border: "1px solid #323852",
            borderRadius: "20px",
            padding: "4px 10px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 500,
            color: "#e2e8f0",
            cursor: "pointer",
            userSelect: "none",
            transition: "all 0.2s ease",
          }}
          title={`Statechart Wire: ${id}`}
        >
          <Zap size={11} color="#f59e0b" />
          <span style={{ color: "#38bdf8" }}>{trigger}</span>
          <ArrowRight size={10} color="#94a3b8" />
          <span style={{ color: "#10b981" }}>{action}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
