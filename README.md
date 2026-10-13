# 🎮 LudusGraph (LudusGraph MCP)

> **Agent-Native Game UI Layout & Statechart Intermediate Representation Platform**  
> *The Single Source of Truth for AI-Human Collaborative Game UI Ideation & Layout Flow.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26-orange.svg)](https://modelcontextprotocol.io)
[![GUIR Spec](https://img.shields.io/badge/GUIR-v1.0.0-emerald.svg)](ARCHITECTURE_V1.md)
[![Status](https://img.shields.io/badge/Architecture-v1%20Approved-success.svg)](ARCHITECTURE_V1.md)

---

## 📖 Giới thiệu (Overview)

**LudusGraph** là nền tảng không gian làm việc vô tận (Infinite Canvas) chạy trên nền Web, đóng vai trò **Tầng trừu tượng hóa bố cục trung gian (Layout Intermediate Representation Layer - GUIR)** kết nối giữa **Nhà phát triển game con người** và **Tác tử AI (Cursor, Claude Code, Antigravity Agent)**.

Hệ thống giải quyết triệt để rào cản **"Mù không gian thị giác" (Visual Spatial Blindness)** khi AI sinh mã giao diện game qua hội thoại văn bản thuần túy, đồng thời ngăn chặn nguy cơ bùng nổ token ngữ cảnh và làm hỏng file cảnh engine (`.tscn` của Godot, `.prefab` của Unity) ở giai đoạn phác thảo ý tưởng.

```
+-----------------------------------------------------------------------------------+
|                                 LUDUSGRAPH ECOSYSTEM                              |
|                                                                                   |
|   +-----------------------+                         +-------------------------+   |
|   |   Human Game Dev /    |   Visual Editing        |   AI Coding Agent       |   |
|   |   UI Designer         |   (Drag, Wire, Focus)   |   (Cursor, Claude Code) |   |
|   +-----------+-----------+                         +------------+------------+   |
|               |                                                  |                |
|               | (WebSocket / JSON Patch)                         | (MCP stdio/HTTP|
|               v                                                  v  7 Atomic Tools|
|   +---------------------------------------------------------------------------+   |
|   |                  LUDUSGRAPH CENTRAL SYNC & MCP SERVER                     |   |
|   |  - In-memory Document Store (Scene Graph + Flow Graph)                    |   |
|   |  - JSON Patch Engine (RFC 6902) & Vector Clocks OCC                       |   |
|   |  - Node-Level Soft-Locking Manager & Self-healing Error Protocol          |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|                                         | Xuất GUIR Artifacts                     |
|                                         v                                         |
|                 +-----------------------------------------------+                 |
|                 |  1. layout_spec.guir.json (Cấu trúc máy đọc)  |                 |
|                 |  2. layout_summary.md (Tối ưu token cho LLM)  |                 |
|                 +-----------------------+-----------------------+                 |
+-----------------------------------------|-----------------------------------------+
                                          |
                                          | Handoff Boundary (Ranh giới chuyển giao)
                                          v
                  +-----------------------------------------------+
                  |       DOWNSTREAM ENGINE COMPILER AGENT        |
                  |  (Độc lập; diễn giải GUIR -> Nodes cụ thể)    |
                  +-----------------------+-----------------------+
                                          |
                         +----------------+----------------+
                         | (godot-mcp)                     | (unity-mcp)
                         v                                 v
            +-------------------------+       +-------------------------+
            |      GODOT ENGINE 4     |       |      UNITY 6 ENGINE     |
            | Control Nodes (.tscn)   |       | UI Toolkit / uGUI       |
            +-------------------------+       +-------------------------+
```

---

## ⚡ 4 Nguyên tắc Kiến trúc Bất biến

1. **Engine-Agnostic Ideation:** Web Canvas và MCP Server tuyệt đối không phụ thuộc runtime vào tệp nhị phân engine. Nhiệm vụ duy nhất là cung cấp bản vẽ bố cục (Layout Blueprint) và ý đồ ngữ nghĩa (`role`, `intent`, `tags`).
2. **Context-Window Frugality:** Tối ưu hóa dung lượng token cho AI Agent. Tách biệt công cụ xem tổng quan (`canvas_get_overview`) và xem chi tiết (`frame_get_details`).
3. **Deterministic Anchors:** Không dùng pixel tuyệt đối cứng nhắc. Toàn bộ hình học dựa trên neo tỷ lệ (`anchor_preset`) chuẩn hóa `[0.0, 1.0]` tương thích với Godot Control & Unity RectTransform.
4. **Statecharts as First-Class Citizens:** Dây nối giữa các khung hình không phải mũi tên vô tri mà là bộ chuyển trạng thái hoàn chỉnh (`trigger`, `guard`, `action`, `animation_hint`).

---

## 🛠️ Bộ 7 Công cụ MCP Nguyên tử (7 Atomic MCP Tools)

LudusGraph cung cấp đúng 7 công cụ tham số hóa cao, tích hợp cơ chế tự phục hồi lỗi (**Self-Healing Error Protocol**):

| # | Công cụ | Chức năng | Tối ưu Token |
|---|---|---|---|
| `1` | `canvas_get_overview` | Lấy danh sách metadata của tất cả Frames & Wires trên canvas. | `< 300` tokens |
| `2` | `frame_get_details` | Lấy chi tiết cây Scene Graph đầy đủ của 1 khung hình chỉ định. | On-demand |
| `3` | `frame_create` | Tạo khung màn hình mới với tỷ lệ chuẩn (`16:9`, `9:16`, `custom`). | Nguyên tử |
| `4` | `frame_batch_mutate` | Thực hiện giao dịch nguyên tử hàng loạt: `add`, `update`, `delete`, `move` UIElement. | Lũy đẳng (Idempotent) |
| `5` | `flow_wire_connect` | Tạo dây nối luồng Statecharts giữa interaction node và khung đích. | Statecharts chuẩn |
| `6` | `flow_wire_disconnect` | Xóa dây nối chuyển trạng thái bằng `wire_id`. | Quản trị đồ thị |
| `7` | `canvas_export_guir` | Xuất `layout_spec.guir.json` và bản tóm tắt `layout_summary.md`. | Bàn giao hạ nguồn |

---

## 📐 Đặc tả GUIR v1.0.0 (Game UI Intermediate Representation)

Mô hình dữ liệu kết hợp giữa:
* **Scene Graph:** Cây node bên trong từng Khung hình (`Container`, `Button`, `Label`, `Rect`, `Ellipse`, `ImagePlaceholder`).
* **Semantic Layer:** Gắn nhãn ý đồ người dùng (`role: "hud_health"`, `intent: "start_gameplay"`, `tags: [...]`).
* **Statechart Flow Graph:** Đồ thị dây nối biểu diễn hành vi chuyển cảnh (`navigate_replace`, `push_popup`, `pop_screen`, `toggle_overlay`).

Xem đặc tả JSON Schema hoàn chỉnh tại [ARCHITECTURE_V1.md](ARCHITECTURE_V1.md#3-mô-hình-dữ-liệu-đặc-tả-guir-v100-data-model--schema-specification).

---

## 🧪 4 Giả định Kiểm chứng Thực nghiệm (Spikes G1 - G4)

* **Spike 1 (G1 - Hiểu đa phương thức):** Agent đọc hiểu GUIR (Hybrid AST + Thumbnail) với độ chính xác $\ge 95\%$, giảm $40\%$ token so với Figma.
* **Spike 2 (G2 - Thao tác ổn định):** Agent mutate canvas qua MCP với $0\%$ tràn viền, số bước gọi công cụ $\le 1.3\times$ tối ưu, tự phục hồi lỗi $100\%$.
* **Spike 3 (G3 - Bàn giao hạ nguồn):** Downstream Agent biên dịch thành công cảnh trên Godot 4 / Unity 6 đạt tương đồng hình ảnh $SSIM \ge 0.88$.
* **Spike 4 (G4 - Đồng tác vụ thời gian thực):** Người và AI cùng chỉnh sửa đồng thời, hội tụ $< 250\text{ms}$, không mất dữ liệu, FPS Web $\ge 55$.

---

## 📂 Cấu trúc Dự án (Monorepo Blueprint)

```
ludusgraph/
├── packages/
│   ├── core/           # Zod Schemas, GUIR Types, Layout & Anchor Math
│   ├── mcp-server/     # Dual MCP Transports (stdio & Streamable HTTP), 7 Tools
│   ├── sync-server/    # WebSocket Gateway, JSON Patch Engine (RFC 6902), OCC Soft-Lock
│   └── web/            # React Flow Canvas (Macro), Scaled DOM Viewport (Micro)
├── docs/               # Tài liệu chi tiết & báo cáo Spike
├── ARCHITECTURE_V1.md  # Tài liệu Kiến trúc Hệ thống v1 hoàn chỉnh
└── README.md
```

---

## 🗺️ Lộ trình Phát triển MVP (14 Tuần)

- [ ] **Giai đoạn 1 (Tuần 1–4):** Canvas Lõi, Scene Graph, Anchor Presets & Bộ đọc/ghi GUIR v1.0.0.
- [ ] **Giai đoạn 2 (Tuần 5–8):** Máy chủ MCP Server (stdio/HTTP), 7 Công cụ nguyên tử, Hệ thống Dây nối Statecharts.
- [ ] **Giai đoạn 3 (Tuần 9–11):** Đồng bộ hóa WebSocket thời gian thực (JSON Patch + Vector Clocks), Thực nghiệm Spikes G1–G4.
- [ ] **Giai đoạn 4 (Tuần 12–14):** Chuẩn hóa Handoff Contract, Đo lường nghiệm thu SSIM $\ge 0.88$, Thử nghiệm Alpha.

---

## 📄 Bản quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại [LICENSE](LICENSE).
