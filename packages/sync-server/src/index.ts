import { WebSocketServer, WebSocket } from "ws";
import { InmemoryDocumentStore } from "./store/document-store.js";
import { SoftLockManager } from "./lock/soft-lock.js";
import type { PatchOperation } from "@ludusgraph/core";

const PORT = parseInt(process.env.PORT || "3001", 10);
const store = new InmemoryDocumentStore();
const lockManager = new SoftLockManager();

const wss = new WebSocketServer({ port: PORT });

console.error(`[LudusGraph Sync Server] Listening on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.error("[LudusGraph Sync] Client connected");

  // Gửi trạng thái tài liệu ban đầu khi client kết nối
  ws.send(
    JSON.stringify({
      type: "INIT_DOCUMENT",
      payload: {
        document: store.getDocument(),
        version: store.getVersion(),
        activeLocks: lockManager.getActiveLocks(),
      },
    })
  );

  ws.on("message", (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case "ACQUIRE_LOCK": {
          const { nodeId, clientId } = msg.payload;
          const ok = lockManager.acquire(nodeId, clientId);
          ws.send(
            JSON.stringify({
              type: "LOCK_RESULT",
              payload: { nodeId, success: ok },
            })
          );
          if (ok) {
            broadcastExcept(ws, {
              type: "LOCK_ACQUIRED",
              payload: { nodeId, clientId },
            });
          }
          break;
        }

        case "RELEASE_LOCK": {
          const { nodeId, clientId } = msg.payload;
          lockManager.release(nodeId, clientId);
          broadcast({
            type: "LOCK_RELEASED",
            payload: { nodeId },
          });
          break;
        }

        case "APPLY_PATCHES": {
          const { patches, version } = msg.payload as {
            patches: PatchOperation[];
            version: number;
          };

          const result = store.applyPatchBatch(patches);
          if (result.success) {
            broadcast({
              type: "PATCHES_APPLIED",
              payload: {
                patches,
                newVersion: result.newVersion,
              },
            });
          } else {
            ws.send(
              JSON.stringify({
                type: "PATCH_REJECTED",
                payload: {
                  currentVersion: store.getVersion(),
                  document: store.getDocument(),
                },
              })
            );
          }
          break;
        }
      }
    } catch (e) {
      console.error("[LudusGraph Sync] Error processing message:", e);
    }
  });

  ws.on("close", () => {
    console.error("[LudusGraph Sync] Client disconnected");
  });
});

function broadcast(msg: object) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastExcept(sender: WebSocket, msg: object) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
