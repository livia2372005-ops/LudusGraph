import {
  type GUIRDocument,
  applyPatches,
  type PatchOperation,
} from "@ludusgraph/core";

export class InmemoryDocumentStore {
  private document: GUIRDocument;
  private version: number = 1;

  constructor(initialDoc?: GUIRDocument) {
    this.document = initialDoc || {
      version: "1.0.0",
      project_meta: {
        project_name: "LudusGraph Sandbox Project",
        target_aspect_ratio: "16:9",
        base_resolution: { width: 1920, height: 1080 },
      },
      frames: [
        {
          id: "frm_title",
          name: "Title Screen",
          world_transform: { x: 0, y: 0, width: 1920, height: 1080 },
          root_element: {
            id: "cnt_root_title",
            name: "RootContainer",
            type: "container",
            layout: {
              anchor_preset: "full_rect",
              offsets: { left: 0, top: 0, right: 0, bottom: 0 },
            },
            visual: { bg_color: "#181824" },
            semantics: { role: "screen_root", intent: "contain_title_ui" },
            children: [
              {
                id: "btn_start",
                name: "StartGameButton",
                type: "button",
                layout: {
                  anchor_preset: "center",
                  offsets: { left: -140, top: -30, right: 140, bottom: 30 },
                },
                visual: {
                  bg_color: "#2ECC71",
                  border_color: "#27AE60",
                  border_width: 2,
                  corner_radius: 8,
                  text_content: "START GAME",
                  font_size: 20,
                  text_align: "center",
                },
                semantics: {
                  role: "cta_button",
                  intent: "start_game",
                  tags: ["menu", "navigation"],
                },
                children: [],
              },
            ],
          },
        },
      ],
      wires: [],
    };
  }

  getDocument(): GUIRDocument {
    return JSON.parse(JSON.stringify(this.document));
  }

  getVersion(): number {
    return this.version;
  }

  applyPatchBatch(patches: PatchOperation[]): { success: boolean; newVersion: number } {
    const res = applyPatches(this.document, patches);
    if (res.success) {
      this.document = res.document;
      this.version += 1;
      return { success: true, newVersion: this.version };
    }
    return { success: false, newVersion: this.version };
  }
}
