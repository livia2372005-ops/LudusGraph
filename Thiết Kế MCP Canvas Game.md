# **Nền Tảng Thiết Kế Bố Cục Trò Chơi 2D Cho Tác Tử AI Thông Qua Giao Thức Bối Cảnh Mô Hình (MCP)**

## **1\. Tầm nhìn kiến trúc, phạm vi thực hiện và các giả định cốt lõi**

Sự phát triển của các mô hình ngôn ngữ lớn và các tác tử tự trị (AI Agents) đang thay đổi căn bản quy trình kỹ thuật phần mềm, tuy nhiên việc ứng dụng tác tử vào phát triển trò chơi điện tử vẫn vấp phải rào cản lớn về mặt không gian thị giác và biểu diễn phân cấp. Hiện nay, khi một lập trình viên sử dụng các tác tử dòng lệnh như Claude Code, Cursor hay Antigravity Agent để thiết kế giao diện (UI) hoặc bố cục màn chơi (Level Layout), việc truyền đạt ý đồ thiết kế qua ngôn ngữ tự nhiên thường dẫn đến sự sai lệch nghiêm trọng về tỷ lệ khung hình, tọa độ neo (anchors) và cấu trúc cây phân cấp. Ngược lại, nếu cho tác tử can thiệp trực tiếp vào mã nguồn động cơ thông qua các máy chủ Model Context Protocol (MCP) của Godot hay Unity ngay từ bước phác thảo ý tưởng, chi phí token ngữ cảnh sẽ bùng nổ, thời gian biên dịch kéo dài và rủi ro làm hỏng tệp cảnh (scene file) là rất cao.  
Hệ thống được nghiên cứu định vị là một "Tầng trừu tượng hóa bố cục trung gian" (Layout Intermediate Representation Layer) hoạt động trên nền tảng Web độc lập. Tầm nhìn cốt lõi là cung cấp một không gian làm việc vô tận (Infinite Workspace) nơi con người và tác tử AI cùng sáng tạo, điều chỉnh và kiểm chứng bố cục game 2D dưới dạng các khung hình (frames) kết nối thông qua các dây nối ngữ nghĩa (semantic wires). Hệ thống đóng vai trò nguồn chân lý duy nhất (Single Source of Truth) về mặt cấu trúc hình học và luồng chuyển đổi trạng thái giao diện, hoàn toàn tách biệt khỏi tầng mã nguồn và hệ thống hàng trăm node phức tạp của động cơ trò chơi ở giai đoạn phác thảo.  
Trong phiên bản đầu tiên (v1), phạm vi của hệ thống tập trung hoàn toàn vào việc thiết lập môi trường web 2D, cung cấp các khối hình học tiêu chuẩn (Rectangle, Ellipse, Text, Image placeholder, Button, Container), hệ thống nhãn ngữ nghĩa tùy biến và một máy chủ MCP tinh gọn với số lượng công cụ tối thiểu để tác tử đọc và chỉnh sửa canvas. Hệ thống kiên quyết nằm ngoài phạm vi can thiệp trực tiếp vào tệp nhị phân hay tệp cảnh của game engine. Hệ thống không tạo tệp .tscn của Godot hay .prefab của Unity, không hỗ trợ mô phỏng vật lý, không dựng hình 3D và không tích hợp mã kịch bản logic phức tạp. Thay vào đó, hệ thống xuất ra bản đặc tả trung gian chuẩn hóa (Game UI Intermediate Representation \- GUIR); từ bản đặc tả này, một tác tử độc lập ở hạ nguồn (Downstream Agent) sẽ đọc và đảm nhiệm việc chuyển giao sang các MCP engine chuyên biệt như godot-mcp hoặc unity-mcp trong một gói nâng cấp độc lập.  
Hệ thống được thiết kế dựa trên bốn giả định kỹ thuật nền tảng cần kiểm chứng thực nghiệm trước khi mở rộng quy mô sản phẩm:

| Mã giả định | Phát biểu giả định cốt lõi | Rủi ro kỹ thuật chính | Phương pháp kiểm chứng thực nghiệm (Spike) | Tiêu chí Đạt / Không đạt (Pass/Fail) |
| :---- | :---- | :---- | :---- | :---- |
| **G1** | Tác tử AI đọc hiểu bản đặc tả bố cục đủ chính xác để suy luận đúng vị trí, quan hệ phân cấp và ý đồ thiết kế. | Mô hình ảo tưởng (hallucinate) vị trí khi chỉ đọc JSON hoặc mất chi tiết phân cấp khi chỉ đọc ảnh raster. | Cung cấp cùng một bố cục qua 3 phương thức: (1) Cây AST JSON thuần, (2) Ảnh chụp canvas, (3) JSON kèm ảnh crop; yêu cầu trả lời bộ câu hỏi 20 mục về quan hệ cha-con và luồng chuyển cảnh. | Đạt: Độ chính xác ngữ nghĩa \\ge 95\\% ở phương thức hybrid; F1-score định vị phần tử \\ge 0.90. Không đạt nếu \< 85\\%. |
| **G2** | Tác tử thao tác tạo và sửa đổi bố cục qua công cụ MCP ổn định, bảo toàn hệ tọa độ và không lặp thao tác. | Tác tử tính sai tọa độ cục bộ bên trong khung, gọi tool đệ quy vô hạn hoặc làm tràn khung chứa. | Giao cho tác tử 30 kịch bản dựng UI từ đơn giản đến phức tạp (HUD, Bảng trang bị); đo độ trôi tọa độ và số bước gọi công cụ. | Đạt: 100\\% bố cục hợp lệ không có phần tử bị tràn biên (clipping); số lần gọi công cụ không vượt quá 1.3\\times số bước tối ưu. |
| **G3** | Bản đặc tả trung gian xuất ra chứa đủ thông tin để Downstream Agent dựng lại hoàn chỉnh trên Godot/Unity. | Thiếu thông số neo (anchors), co giãn (stretch) hoặc thiếu định danh sự kiện dẫn đến việc engine không thể tái tạo. | Chuyển bản đặc tả sang Downstream Agent điều khiển godot-mcp để dựng cảnh .tscn thật; chạy game headless và so sánh đối chiếu. | Đạt: Chỉ số tương đồng cấu trúc hình ảnh (SSIM) \\ge 0.88 giữa web canvas và runtime screenshot; không phát sinh lỗi biên dịch UI. |
| **G4** | Người dùng và AI cùng thao tác chỉnh sửa đồng thời trên cùng một khung vẽ mà không phá vỡ dữ liệu của nhau. | Tranh chấp ghi đè thuộc tính (Race condition), khóa chết trạng thái hoặc làm giật lag giao diện người dùng. | Mô phỏng kịch bản người dùng kéo thả chuột liên tục trong khi tác tử gọi batch mutation thông qua MCP trên cùng một cây DOM ảo. | Đạt: Thời gian hội tụ trạng thái \< 250\\text{ms}; không xảy ra mất mát dữ liệu (zero data loss); giao diện duy trì \\ge 55 FPS. |

## **2\. Đối tượng thụ hưởng và kịch bản vận hành thực tế**

Hệ thống hướng tới ba nhóm đối tượng người dùng chính trong quy trình phát triển phần mềm hiện đại. Nhóm trọng tâm là các lập trình viên trò chơi độc lập (Indie Game Developers) làm việc cùng các tác tử dòng lệnh như Claude Code, Cursor hoặc Antigravity Agent. Nhóm này có năng lực kỹ thuật vững vàng nhưng bị giới hạn về nguồn lực thiết kế mỹ thuật và thường xuyên gặp khó khăn trong việc truyền đạt cấu trúc không gian cho AI qua cửa sổ hội thoại. Nhóm thứ hai là các nhà thiết kế trò chơi (Game Designers) cần phác thảo nhanh cơ chế chơi, bố cục giao diện và luồng trạng thái mà không muốn phải mở các bộ biên tập cồng kềnh của Unity hay Godot. Nhóm thứ ba là những người sáng tạo không chuyên (Hobbyists) muốn xây dựng trò chơi nhưng thiếu kỹ năng lập trình giao diện phức tạp.  
Khi diễn đạt bố cục giao diện cho tác tử AI bằng ngôn ngữ tự nhiên thuần túy, người phát triển thường đối mặt với các điểm đau mang tính hệ thống. Tính chất mơ hồ của văn bản khiến các mô tả như "đặt nút Chơi ở giữa, bên dưới là nút Thoát, thanh máu nằm góc trên" thường dẫn đến việc AI sinh ra các tọa độ cứng (hard-coded absolute pixels) chồng chéo lên nhau hoặc vỡ vụn khi co giãn màn hình. Nghiêm trọng hơn, ngôn ngữ tự nhiên không thể diễn đạt một cách chính xác các luồng chuyển trạng thái có điều kiện (conditional state transitions) của giao diện game, chẳng hạn như hành vi mở bảng cài đặt dạng pop-up đè lên màn hình chính và tạm dừng trò chơi. Việc thiếu một giao diện thị giác hai chiều khiến vòng lặp thử \- sai phải diễn ra trực tiếp trên game engine, làm tiêu tốn hàng trăm nghìn token bối cảnh và kéo dài chu kỳ lặp lại.  
Quy trình vận hành thực tế của hệ thống được hiện thực hóa qua bốn kịch bản cốt lõi:  
Thứ nhất là kịch bản phác thảo cụm Menu chính và điều hướng phân nhánh. Người dùng yêu cầu tác tử dòng lệnh: "Tạo cấu trúc menu chính cho game roguelike bao gồm màn hình Title, màn hình Chọn nhân vật và bảng Cài đặt". Tác tử gọi công cụ MCP để tạo ba khung canvas tỷ lệ 16:9, tự động thêm các nút bấm tiêu chuẩn và thiết lập dây nối luồng: sự kiện nhấn nút Bắt đầu chuyển sang màn hình Chọn nhân vật, sự kiện nhấn Cài đặt kích hoạt pop-up Cài đặt. Tác tử mở một cổng HTTP cục bộ, người dùng truy cập giao diện web, kiểm tra trực quan toàn bộ sơ đồ, dùng chuột kéo mở rộng khung nút bấm và điều chỉnh màu sắc cho phù hợp thẩm mỹ.  
Thứ hai là kịch bản thiết lập giao diện hiển thị trong màn chơi (HUD). Người dùng yêu cầu tác tử dựng khung HUD cho game đi cảnh màn hình ngang. Tác tử khởi tạo khung tỷ lệ màn hình chuẩn, bố trí cụm thanh máu neo ở góc trên bên trái, bản đồ con neo ở góc trên bên phải và cụm nút kỹ năng neo ở góc dưới bên phải. Khi người dùng nhấp đúp vào khung để mở chế độ phóng to toàn màn hình, các thuộc tính neo và khoảng cách đệm hiển thị rõ ràng, cho phép người dùng tinh chỉnh từng pixel và gắn nhãn ngữ nghĩa chuyên biệt cho từng ô chiêu thức.  
Thứ ba là kịch bản đồng sáng tạo lặp giữa người dùng và tác tử (Iterative Co-refinement). Người dùng vẽ một hình chữ nhật lớn trên canvas và gán nhãn thô là "Khu vực trang bị", sau đó ra lệnh cho tác tử: "Chia khung này thành lưới 4 nhân 6 ô đồ, mỗi ô có viền đen nền xám, thêm một vùng hiển thị chỉ số vật phẩm ở cạnh phải". Tác tử truy xuất định danh của khung qua MCP, tính toán cấu trúc lưới và phát sinh đồng loạt các node con thông qua một lần gọi công cụ duy nhất mà không làm sai lệch vị trí người dùng đã định hình.  
Thứ tư là kịch bản chuyển giao sang động cơ thực thi. Khi người dùng đã hài lòng với bố cục và luồng chuyển đổi trên web, họ chỉ định cho Downstream Agent: "Đọc bản đặc tả màn hình Menu và dựng cảnh hoàn chỉnh trong Godot 4". Tác tử hạ nguồn nhận bản đặc tả GUIR từ hệ thống, phân tích cây phân cấp và các thuộc tính neo, sau đó gọi các công cụ của godot-mcp để tự động tạo một Control node gốc, đính kèm VBoxContainer, tạo các nút bấm và gắn kết tín hiệu điều hướng tương ứng.  
Chu trình vận hành này tạo nên một chuỗi tương tác khép kín: Người dùng thao tác chỉnh sửa trực quan trên Web Canvas Workspace; Web Canvas Workspace đồng bộ hai chiều với Máy chủ MCP trung tâm; Tác tử AI tương tác đọc/ghi vào Máy chủ MCP qua các công cụ tham số hóa; cuối cùng, bản đặc tả GUIR được chuyển giao sang Downstream Agent để điều khiển Game Engine Runtime thông qua các công cụ chuyên biệt của engine.

## **3\. Kết quả khảo sát sản phẩm hiện có và định vị giải pháp**

Nhằm xác lập cơ sở kỹ thuật vững chắc, các công cụ đồ họa, bảng vẽ wireframe và môi trường giao diện động cơ game hiện hành được đưa vào phân tích đối chuẩn toàn diện:

| Nhóm công cụ | Đại diện tiêu biểu | Không gian vô tận | Đa khung hình (Multi-frame) | Dây nối có ngữ nghĩa | Giao diện Agent (MCP) | Xuất đặc tả trung gian | Tính tương thích bố cục Game |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Thiết kế giao diện** | Figma, Penpot | Hỗ trợ canvas phẳng vô tận, gom nhóm qua Frames. | Có; hỗ trợ lồng ghép nhiều Artboard/Frame. | Prototype links cơ bản, thiếu máy trạng thái. | Figma MCP hỗ trợ đọc bối cảnh nhưng schema rất nặng (\~5K–9K tokens); Penpot đang thử nghiệm. | Xuất JSON REST API nặng, chứa nhiều thông tin đồ họa thừa. | Dựa trên Flexbox/Auto-layout; không có cơ chế Neo game đặc thù. |
| **Bảng vẽ tự do** | tldraw, Excalidraw | Canvas phẳng vô tận hoàn toàn. | Không có khái niệm khung canvas độc lập; chỉ là các nhóm hình vẽ. | Mũi tên đồ họa hình học thuần túy, không có thuộc tính logic. | Chưa có chuẩn MCP chính thức; tích hợp AI chủ yếu qua webhook ngoài. | JSON hình học phẳng đơn giản, thiếu ngữ nghĩa phân cấp UI. | Hoàn toàn không có ràng buộc tự động layout hay neo tỷ lệ màn hình. |
| **Sơ đồ luồng & Kịch bản** | Twine, articy:draft | Dạng node-graph phân nhánh, canvas phẳng. | Các node đại diện cho đoạn văn bản hoặc trạng thái logic. | Rất mạnh về mặt phân nhánh kịch bản logic nhưng không gắn với UI visual. | Không hỗ trợ Model Context Protocol. | Xuất định dạng kịch bản phân nhánh (Twee, XML), thiếu thông số layout. | Không hỗ trợ thiết kế bố cục hình học giao diện. |
| **Bộ biên tập Động cơ** | Godot Control, Unity UI Toolkit | Không có; chỉ thao tác trên một Viewport đơn lẻ của Scene. | Không có; quản lý qua các file Scene/UXML độc lập. | Không có; liên kết logic phải viết hoàn toàn bằng mã C\#/GDScript. | MCP tồn tại độc lập qua cộng đồng (godot-mcp, unity-mcp) nhưng nặng về runtime. | File nội bộ engine (.tscn, .uxml), khóa chặt vào runtime cụ thể. | Rất mạnh; hỗ trợ đầy đủ Anchor Presets, Size Flags, RectTransform. |
| **Giải pháp đề xuất** | **Hệ thống hiện tại** | **Canvas vô tận, tối ưu pan/zoom và culling** | **Hỗ trợ đa khung với tỷ lệ màn hình chuẩn hóa** | **Dây nối chuẩn Statecharts (Trigger, Guard, Action)** | **Agent-native MCP tối giản; tối ưu token, tự sửa sai** | **Xuất GUIR chuẩn hóa, ánh xạ trừu tượng sang Container động cơ** | **Tích hợp sẵn chuẩn Game Anchors và Flex Containers** |

Các nền tảng thiết kế chuyên nghiệp như Figma hay Penpot được phát triển hướng tới sản phẩm web và ứng dụng di động. Khi áp dụng vào trò chơi điện tử, hệ thống phân cấp của Figma sản sinh ra quá nhiều node bao bọc trung gian không cần thiết, trong khi máy chủ Figma MCP tiêu tốn một lượng token bối cảnh khổng lồ cho các dữ liệu tạo kiểu không phục vụ cho việc dựng khung xương game. Ngược lại, các công cụ vẽ tự do như tldraw hay Excalidraw lại thiếu vắng tính kỷ luật hình học: các liên kết mũi tên không mang ngữ nghĩa lập trình, khiến tác tử AI không thể suy luận được mối quan hệ kích hoạt sự kiện.  
Giải pháp nghiên cứu giải quyết chính xác khoảng trống công nghệ này bằng cách thiết lập một bảng vẽ ngữ nghĩa dành riêng cho game. Hệ thống loại bỏ sự phức tạp về mặt đồ họa nâng cao, đồng thời tích hợp chặt chẽ cơ chế neo hình học của game engine và mô hình máy trạng thái vào từng sợi dây liên kết.

## **4\. Mô hình dữ liệu và đặc tả bố cục (Data Model & Schema)**

Mô hình dữ liệu của hệ thống được tổ chức dưới dạng cấu trúc đồ thị phân cấp lai (Hybrid Hierarchical Flow Graph), kết hợp chặt chẽ giữa Scene Graph biểu diễn bố cục không gian bên trong từng khung, Lớp ngữ nghĩa biểu diễn ý đồ thiết kế, và Flow Graph biểu diễn tương tác chuyển trạng thái.  
Hệ tọa độ của không gian làm việc vô tận sử dụng hệ trục Descartes phẳng (X\_{world}, Y\_{world}) \\in \\mathbb{R}^2. Tuy nhiên, để đảm bảo tính độc lập với độ phân giải màn hình của game engine, hệ tọa độ cục bộ bên trong mỗi Khung hình (Frame) được chuẩn hóa theo tỷ lệ tương đối trong đoạn \[0.0, 1.0\], kết hợp với độ lệch điểm ảnh cố định (Pixel Offset).  
Tọa độ điểm ảnh thực tế của một phần tử con được tính toán thông qua kích thước phần tử cha và các thông số neo:  
x\_{pixel} \= x\_{parent\\\_width} \\cdot anchor.min\\\_x \+ offset.left  
Hệ thống kế thừa toàn bộ cơ chế neo tiêu chuẩn của các game engine hiện đại (tương đương Anchor Presets trong Godot 4 và RectTransform trong Unity). Bản đặc tả JSON Schema hoàn chỉnh của hệ thống được định nghĩa như sau:  
{  
  "\$schema": "https\://json-schema.org/draft/2020-12/schema",  
  "title": "GameUILayoutSpecification",  
  "type": "object",  
  "required": \["version", "project\_meta", "frames", "wires"\],  
  "properties": {  
    "version": { "type": "string", "enum": \["1.0.0"\] },  
    "proj\[span\_62\](start\_span)\[span\_62\](end\_span)\[span\_67\](start\_span)\[span\_67\](end\_span)ect\_meta": {  
      "type": "object",  
      "required": \["target\_aspect\_ratio", "base\_resolution"\],  
      "properties": {  
        "target\_aspect\_ratio": { "type": "string", "example": "16:9" },  
        "base\_resolution": {  
          "type": "object",  
          "properties": {  
            "width": { "type": "integer", "default": 1920 },  
            "height": { "type": "integer", "default": 1080 }  
          }  
        }  
      }  
    },  
    "frames": {  
      "type": "array",  
      "items": { "\$ref": "\#/\$defs/FrameNode" }  
    },  
    "wires": {  
      "type": "array",  
      "items": { "\$ref": "\#/\$defs/FlowWire" }  
    }  
  },  
  "\$defs": {  
    "FrameNode": {  
      "type": "object",  
      "required": \["id", "name", "world\_transform", "root\_element"\],  
      "properties": {  
        "id": { "type": "string" },  
        "name": { "type": "string" },  
        "world\_transform": {  
          "type": "object",  
          "properties": {  
            "x": { "type": "number" },  
            "y": { "type": "number" },  
            "width": { "type": "number" },  
            "height": { "type": "number" }  
          }  
        },  
        "root\_element": { "$ref":"#/$defs/UIElement" }  
      }  
    },  
    "UIElement": {  
      "type": "object",  
      "required": \["id", "type", "layout", "semantics"\],  
      "properties": {  
        "id": { "type": "string" },  
        "name": { "type": "string" },  
        "type": {   
          "type": "string",   
          "enum": \["container", "button", "label", "rect", "ellipse", "image\_placeholder"\]   
        },  
        "layout": {  
          "type": "object",  
          "properties": {  
            "anchor\_preset": {  
              "type": "string",  
              "enum": \[  
                "top\_left", "top\_right", "bottom\_left", "bottom\_right",  
                "center", "center\_top", "center\_bottom",  
                "full\_rect", "h\_stretch\_top", "v\_stretch\_left"  
              \]  
            },  
            "offsets": {  
              "type": "object",  
              "properties": {  
                "left": { "type": "number", "default": 0 },  
                "top": { "type": "number", "default": 0 },  
                "right": { "type": "number", "default": 0 },  
                "bottom": { "type": "number", "default": 0 }  
              }  
            },  
            "flex\_direction": { "type": "string", "enum": \["none", "horizontal", "vertical"\] },  
            "gap": { "type": "number", "default": 0 },  
            "padding": { "type": "number", "default": 0 }  
          }  
        },  
        "visual": {  
          "type": "object",  
          "properties": {  
            "bg\_color": { "type": "string" },  
            "border\_color": { "type": "string" },  
            "border\_width": { "type": "number" },  
            "corner\_radius": { "type": "number" },  
            "text\_content": { "type": "string" },  
            "font\_size": { "type": "number" },  
            "text\_align": { "type": "string", "enum": \["left", "center", "right"\] }  
          }  
        },  
        "semantics": {  
          "type": "object",  
          "required": \["role", "intent"\],  
          "properties": {  
            "role": { "type": "string" },  
            "intent": { "type": "string" },  
            "tags": { "type": "array", "items": { "type": "string" } },  
            "custom\_payload": { "type": "object" }  
          }  
        },  
        "children": {  
          "type": "array",  
          "items": { "$ref":"#/$defs/UIElement" }  
        }  
      }  
    },  
    "FlowWire": {  
      "type": "object",  
      "required": \["id", "source\_frame\_id", "source\_node\_id", "target\_frame\_id", "transition"\],  
      "properties": {  
        "id": { "type": "string" },  
        "source\_frame\_id": { "type": "string" },  
        "source\_node\_id": { "type": "string" },  
        "target\_frame\_id": { "type": "string" },  
        "transition": {  
          "type": "object",  
          "required": \["trigger", "action"\],  
          "properties": {  
            "trigger": {   
              "type": "string",   
              "enum": \["on\_click", "on\_hover", "on\_timeout", "on\_condition\_met"\]   
            },  
            "guard": { "type": "string" },  
            "action": {   
              "type": "string",   
              "enum": \["navigate\_replace", "push\_popup", "pop\_screen", "toggle\_overlay"\]   
            },  
            "animation\_hint": {   
              "type": "string",   
              "enum": \["instant", "fade", "slide\_left", "slide\_up"\]   
            }  
          }  
        }  
      }  
    }  
  }  
}

Mô hình Flow Graph dựa trên nền tảng lý thuyết Statecharts (máy trạng thái phân cấp). Một dây nối không đơn thuần là liên kết điều hướng thị giác mà biểu diễn một bước chuyển đổi trạng thái hoàn chỉnh với đầy đủ phần tử nguồn phát tín hiệu (source\_node\_id), điều kiện chặn (guard), hành vi động cơ cần thực thi (action), và khung đích biểu diễn trạng thái kế tiếp (target\_frame\_id).

## **5\. Danh mục công cụ Model Context Protocol (MCP)**

Giao thức MCP được triển khai nhằm cung cấp giao diện lập trình trực tiếp cho tác tử AI. Khác với các hệ thống đồ họa tổng quát đòi hỏi hàng chục công cụ chi tiết gây lãng phí dung lượng bối cảnh, hệ thống tối ưu hóa bề mặt công cụ xuống còn bảy công cụ nguyên tử và mang tính tham số hóa cao.  
Các nguyên tắc thiết kế công cụ cốt lõi bao gồm:  
Thứ nhất là kiểm soát cửa sổ bối cảnh và phân tách mức độ chi tiết thông tin. Hệ thống phân tách hoàn toàn công cụ đọc tổng quan và công cụ đọc chi tiết. Tác tử chỉ truy xuất cây phân cấp đầy đủ của một khung hình khi thực sự cần chỉnh sửa khung hình đó, giúp giảm đáng kể chi phí token so với các giao diện MCP truyền thống.  
Thứ hai là đảm bảo tính lũy đẳng (Idempotence) và hỗ trợ đột biến hàng loạt (Batch Mutations). Mọi thao tác cập nhật cấu trúc đều sử dụng danh sách các lệnh nguyên tử với định danh UUID xác định trước, loại bỏ nguy cơ trùng lặp phần tử khi tác tử vô tình thử lại yêu cầu do mạng gián đoạn.  
Thứ ba là cung cấp thông báo lỗi hỗ trợ tự sửa sai (Self-healing Error Responses). Khi một tham số bị sai định dạng, thông báo phản hồi không chỉ báo lỗi HTTP thuần túy mà trả về danh sách các giá trị hợp lệ cùng gợi ý điều chỉnh cụ thể.  
Danh mục bảy công cụ MCP được chuẩn hóa như sau:  
Thứ nhất là công cụ canvas\_get\_overview. Công cụ này cho phép tác tử lấy danh sách tất cả các khung hình hiện có trên canvas (chỉ gồm ID, tên, kích thước, tọa độ thế giới) và danh sách dây nối, hoàn toàn không kèm theo các node con bên trong. Tham số đầu vào là đối tượng rỗng {}. Kết quả trả về chứa tổng số khung hình, mảng thông tin tóm tắt của các khung hình và mảng các liên kết trạng thái.  
Thứ hai là công cụ frame\_get\_details. Công cụ này dùng để truy xuất toàn bộ cây phân cấp Scene Graph và thuộc tính ngữ nghĩa của một khung hình cụ thể. Tham số đầu vào gồm frame\_id (chuỗi định danh khung). Kết quả trả về là đối tượng chứa chi tiết cây node từ root\_element trở xuống.  
Thứ ba là công cụ frame\_create. Công cụ này cho phép tác tử tạo một khung canvas mới trên không gian làm việc vô tận. Tham số đầu vào gồm name (tên khung), world\_x và world\_y (tọa độ trên không gian vô tận), aspect\_ratio (tỷ lệ màn hình), width và height. Kết quả trả về gồm cờ success, frame\_id mới tạo và thông điệp trạng thái.  
Thứ tư là công cụ frame\_batch\_mutate. Đây là công cụ quan trọng nhất để thực hiện hàng loạt thao tác thêm (add), sửa (update), xóa (delete) các phần tử UI bên trong một khung hình theo cơ chế giao dịch nguyên tử. Cấu trúc đầu vào và đầu ra mẫu của công cụ như sau:  
{  
  "frame\_id": "frm\_01",  
  "operations": \[  
    {  
      "op": "add",  
      "parent\_id": "root",  
      "element": {  
        "id": "btn\_play",  
        "name": "PlayButton",  
        "type": "button",  
        "layout": {   
          "anchor\_preset": "center",   
          "offsets": { "left": \-100, "top": \-30, "right": 100, "bottom": 30 }   
        },  
        "visual": {   
          "text\_content": "START GAME",   
          "bg\_color": "\#2ECC71",   
          "font\_size": 24   
        },  
        "semantics": {   
          "role": "cta\_button",   
          "intent": "trigger\_game\_start",   
          "tags": \["menu", "navigation"\]   
        }  
      }  
    }  
  \]  
}

Kết quả trả về của thao tác này xác nhận tính thành công: {"success": true, "applied\_ops": 1, "frame\_version": 4}.  
Thứ năm là công cụ flow\_wire\_connect. Công cụ này cho phép tác tử thiết lập dây nối luồng trạng thái từ một nút bấm thuộc khung nguồn sang một khung đích. Tham số đầu vào gồm wire\_id, source\_frame\_id, source\_node\_id, target\_frame\_id, cùng đối tượng transition chứa các thuộc tính kích hoạt (trigger), điều kiện chặn (guard), hành vi (action) và gợi ý diễn hoạt (animation\_hint). Kết quả trả về gồm cờ success và wire\_id.  
Thứ sáu là công cụ flow\_wire\_disconnect. Công cụ dùng để xóa dây nối chuyển trạng thái giữa các khung. Tham số đầu vào gồm wire\_id. Kết quả trả về xác nhận trạng thái xóa bỏ.  
Thứ bảy là công cụ canvas\_export\_guir. Công cụ này dùng để xuất toàn bộ bản đặc tả dưới dạng JSON GUIR chuẩn hóa và một bản tóm tắt Markdown súc tích để nạp trực tiếp vào bối cảnh của Downstream Agent. Tham số đầu vào gồm cờ include\_markdown\_summary (boolean). Kết quả trả về gồm đối tượng json\_spec và chuỗi markdown\_summary.  
Khi tác tử gửi yêu cầu sai tham số (chẳng hạn gán sai giá trị neo), hệ thống sẽ trả về phản hồi hỗ trợ tự sửa sai:  
{  
  "isError": true,  
  "error\_code": "INVALID\_LAYOUT\_PROPERTY",  
  "message": "Giá trị anchor\_preset 'middle\_center' không hợp lệ tại node 'btn\_play'.",  
  "resolution\_guidance": "Vui lòng chọn một trong các preset hợp lệ sau: \['top\_left', 'top\_right', 'bottom\_left', 'bottom\_right', 'center', 'center\_top', 'center\_bottom', 'full\_rect', 'h\_stretch\_top', 'v\_stretch\_left'\]. Nếu muốn căn chính giữa, hãy sử dụng 'center'."  
}

## **6\. Kiến trúc hệ thống và cơ chế đồng bộ hóa thời gian thực**

Việc lựa chọn thư viện nền tảng cho canvas đòi hỏi sự cân nhắc giữa tính năng tương tác và rủi ro pháp lý về giấy phép mã nguồn mở:

| Thư viện | Giấy phép bản quyền | Điểm mạnh kỹ thuật | Rủi ro và Hạn chế | Quyết định kiến trúc |
| :---- | :---- | :---- | :---- | :---- |
| **tldraw** | Custom License (Source-available) | Trải nghiệm vẽ vô tận tốt, hỗ trợ multiplayer tích hợp sẵn qua SDK. | **Không phải Open Source (OSI)**; yêu cầu trả phí thương mại \~\$6,000/năm từ bản 4.0 và bắt buộc watermark ở bản hobby. | **Loại trừ** do rủi ro pháp lý và chi phí thương mại cao khi mở rộng dự án. |
| **React Flow (xyflow)** | MIT License vĩnh viễn | Quản lý Node-Edge và sub-flows/grouping tối ưu; cộng đồng lớn; tối ưu cho luồng sơ đồ. | Không phải canvas vẽ tự do; xử lý hệ tọa độ lồng nhau (nested coordinates) phức tạp khi zoom sâu. | **Được chọn cho tầng Flow Graph** (quản lý liên kết giữa các Frames và Wires). |
| **Konva.js / Pixi.js** | MIT License | Hiệu năng 2D cao dựa trên Canvas/WebGL; kiểm soát chi tiết từng hình học; hoàn toàn mở. | Không có sẵn hệ thống dây nối và hệ thống tương tác phong phú theo kiểu DOM. | **Được chọn cho tầng Nội dung Frame** (vẽ các primitives bên trong mỗi khung canvas). |
| **Excalidraw** | MIT License | Hoàn toàn miễn phí, mã nguồn mở, dễ dàng tự lưu trữ (self-host). | Phong cách vẽ tay (sketch) mặc định không phù hợp với chuẩn UI công nghiệp. | **Không phù hợp** về mặt thẩm mỹ và kiểu dáng kỹ thuật. |

Kiến trúc frontend được xây dựng theo mô hình Viewport lai (Hybrid Viewport Architecture). React Flow đóng vai trò tầng điều phối vĩ mô (Macro Canvas), chịu trách nhiệm quản lý tọa độ không gian vô tận của các Khung hình và kết nối các Dây nối chuyển trạng thái. Bên trong mỗi Khung hình (được triển khai dưới dạng một Custom Node của React Flow), một bề mặt hiển thị phẳng dựa trên Konva hoặc hệ thống DOM co giãn được kích hoạt để hiển thị các UI primitives với độ chính xác điểm ảnh tuyệt đối.  
Về cơ chế đồng bộ hóa giữa con người và tác tử AI, việc sử dụng các giải pháp CRDT phân tán hoàn toàn (như Yjs hoặc Automerge) mang lại khả năng cộng tác không cần máy chủ, nhưng bộc lộ nhược điểm lớn khi xử lý các ràng buộc toàn vẹn của cây giao diện game. Các thao tác của tác tử AI thường mang tính biến đổi cấu trúc vĩ mô (tạo đồng loạt 10 node, căn chỉnh lại toàn bộ bảng), nếu hai tác tử hoặc người dùng cùng di chuyển một cụm node trong mô hình CRDT, việc tự động hòa giải có thể sinh ra các trạng thái dị dạng như chu trình lồng nhau hoặc node bị cô lập.  
Do đó, hệ thống lựa chọn kiến trúc Máy chủ thẩm quyền trung tâm (Central Authority) kết hợp chuẩn JSON Patch (RFC 6902\) và Vector Clocks. Máy chủ lưu trữ trạng thái cây tài liệu trong bộ nhớ (In-memory Document Store). Mọi thay đổi từ giao diện web của người dùng được gửi về máy chủ qua kết nối WebSocket dưới dạng các vi thao tác JSON Patch. Mọi thay đổi từ tác tử AI thông qua MCP Tool frame\_batch\_mutate được gửi dưới dạng giao dịch nguyên tử.  
Máy chủ kiểm định tính hợp lệ của dữ liệu trước khi lưu trữ. Nếu người dùng và AI cùng sửa đổi một thuộc tính đồng thời, thuật toán Khóa lạc quan (Optimistic Concurrency Control) dựa trên phiên bản sẽ ưu tiên thao tác của người dùng cuối, đồng thời phát sinh thông báo trạng thái cập nhật mới cho tác tử AI qua kênh SSE stream của giao thức MCP Streamable HTTP.  
Tuân thủ đặc tả MCP chuẩn phiên bản 2025-03-26, hệ thống hỗ trợ song song hai cơ chế giao vận:  
Thứ nhất là cơ chế Cục bộ (Local stdio). Khi người dùng chạy tác tử (Cursor, Claude Code) trực tiếp trên máy trạm cá nhân, máy chủ MCP chạy dưới dạng tiến trình Node.js nội bộ, giao tiếp qua luồng dữ liệu chuẩn stdio với độ trễ tiệm cận 0ms và mức độ bảo mật cao.  
Thứ hai là cơ chế Từ xa (Remote Streamable HTTP). Khi hệ thống triển khai trên hạ tầng đám mây cho nhóm cộng tác, giao thức Streamable HTT\[span\_32\](start\_span)\[span\_32\](end\_span)P được kích hoạt. Giao thức này sử dụng một endpoint HTTP duy nhất xử lý các yêu cầu POST và duy trì luồng Server-Sent Events (SSE) để truyền thông báo thời gian thực về thay đổi canvas cho tác tử, xác thực phiên thông qua tiêu đề Mcp-Session-Id.  
Toàn bộ luồng dữ liệu của hệ thống được vận hành nhịp nhàng: Trình duyệt Web gửi các thao tác của người dùng qua WebSocket nhị phân tới Máy chủ thẩm quyền trung tâm. Máy chủ xử lý qua bộ kiểm định Schema, ghi nhận vào bộ nhớ và nhật ký sự kiện, đồng thời phát tín hiệu cập nhật trạng thái qua SSE Stream tới Tác tử AI. Khi tác tử thực hiện các lệnh gọi công cụ MCP qua giao vận HTTP hoặc stdio, các đột biến này lại được máy chủ xác thực và phản hồi ngược lại trình duyệt Web theo thời gian thực.

## **7\. Trải nghiệm người dùng (UX) và tương tác trực quan**

Trải nghiệm người dùng được tối ưu hóa nhằm giải quyết mâu thuẫn giữa hai góc nhìn: góc nhìn bao quát toàn bộ luồng game và góc nhìn chi tiết khi thiết kế từng thành phần đồ họa.  
Giao diện làm việc phân cấp thành ba chế độ tương tác chủ đạo:  
Thứ nhất là Không gian làm việc vô tận (Infinite Workspace View). Người dùng có thể di chuyển và phóng to thu nhỏ mượt mà từ 10\\% đến 400\\%. Để đảm bảo hiệu năng khi dự án có hàng chục khung hình lớn, thuật toán Culling và Mức độ chi tiết (Level of Detail \- LOD) được kích hoạt: khi zoom ra xa hơn mức 30\\%, nội dung chi tiết bên trong khung sẽ được thay thế bằng hình ảnh phẳng thu nhỏ (raster thumbnail), giải phóng tài nguyên tính toán của trình duyệt. Tại chế độ này, người dùng có thể nhấp chuột để tạo nhanh các khung hình theo các tỷ lệ tiêu chuẩn: Khung ngang 16:9 (PC/Console), Khung dọc 9:16 (Mobile Casual), hoặc kích thước tùy chỉnh.  
Thứ hai là Chế độ Tiêu điểm Toàn màn hình (Full-screen Frame Focus Mode). Khi người dùng nhấp đúp vào bất kỳ khung canvas nào, giao diện sẽ kích hoạt chuyển động nội suy mượt mà, phóng to khung đó chiếm trọn màn hình làm việc và tạm ẩn các khung khác. Lúc này, thanh công cụ thiết kế chuyên sâu xuất hiện ở cạnh màn hình, cung cấp đầy đủ các khối linh kiện: Hộp chứa (Container), Nút bấm (Button), Nhãn chữ (Label), Khối hình học (Shapes), và các linh kiện game mẫu (Game Component Prefabs: Thanh máu/năng lượng, Ô chứa đồ, Khung thoại hội thoại, Bảng điểm). Người dùng có thể kéo thả, căn chỉnh lề neo và thay đổi thuộc tính màu sắc trực quan. Nhấn phím Escape sẽ đưa giao diện trở lại không gian vô tận bao quát.  
Thứ ba là Cơ chế Kéo dây Ngữ nghĩa (Semantic Wiring UX). Mỗi phần tử tương tác (như Nút bấm) đều hiển thị các điểm neo kết nối ở cạnh viền. Khi người dùng kéo một đường dây từ nút bấm của Khung A sang Khung B, một bảng cấu hình pop-up xuất hiện ngay tại điểm thả chuột. Người dùng thiết lập nhanh:

> * Sự kiện kích hoạt (Trigger): Nhấn chuột (on\_click), Rê chuột (on\_hover), hoặc Đếm ngược thời gian (on\_timeout).  
> * Hành vi chuyển đổi (Action): Thay thế màn hình (navigate\_replace), Mở bảng nổi (push\_popup), hoặc Đóng màn hình (pop\_screen).  
> * Hiệu ứng chuyển cảnh (Transition hint): Làm mờ dần (fade), Trượt từ phải sang (slide\_left), hoặc Tức thì (instant).

Đường dây nối được vẽ bằng đường cong Bezier mượt mà, hiển thị nhãn chữ trực quan ghi rõ sự kiện (ví dụ: on\_click \-\> push\_popup) ngay trên thân dây, giúp cả con người và tác tử AI lập tức nắm bắt được luồng chuyển đổi trạng thái mà không cần đọc mã lệnh.

## **8\. Đặc tả trung gian GUIR và ranh giới chuyển giao hạ nguồn (Downstream Handoff Boundary)**

Trong các game engine hiện đại, số lượng node và component phục vụ giao diện là cực kỳ đa dạng và có triết lý biểu diễn khác nhau. Godot 4 sở hữu hàng chục Control node chuyên biệt như MarginContainer, VBoxContainer, NinePatchRect, TextureProgressBar, ItemList, Tree. Trong khi đó, Unity tồn tại song song cả hai hệ thống: uGUI (dựa trên GameObject, RectTransform, CanvasScaler) và UI Toolkit (dựa trên cây ảo VisualElement, UXML, USS tương tự web flexbox). Nếu hệ thống Web Canvas cố gắng ánh xạ cứng hoặc bao quát hết hàng trăm loại node này ngay từ v1, hệ thống sẽ rơi vào cái bẫy "bùng nổ tổ hợp" (combinatorial explosion), rò rỉ trừu tượng (leaky abstraction) và làm bùng nổ token ngữ cảnh khiến tác tử AI dễ bị ảo tưởng.  
Do đó, **nhiệm vụ duy nhất của MCP Canvas Game là cung cấp bản vẽ bố cục (Layout Blueprint) và vị trí tương quan cùng ý đồ người dùng**. Việc một phần tử đồ họa trên canvas được hiện thực hóa cụ thể thành node gì trong engine (TextureProgressBar hay ColorRect, VBoxContainer hay GridContainer) thuộc về phạm vi năng lực của một **Hạ nguồn Compiler Agent (Downstream Agent)** độc lập kết hợp với các MCP engine chuyên biệt (godot-mcp, unity-mcp), và sẽ là một bản nâng cấp lớn riêng biệt.  
Hợp đồng ngữ nghĩa (Semantic Contract) phân định ranh giới trách nhiệm giữa Canvas và Downstream Agent được thiết lập như sau:

| Nhóm thuộc tính | Dữ liệu Canvas xuất ra (GUIR Spec) | Trách nhiệm của Web Canvas | Trách nhiệm của Downstream Agent (Gói nâng cấp riêng) |
| :---- | :---- | :---- | :---- |
| **Hình học & Bố cục** | Hệ tọa độ chuẩn hóa \[0.0, 1.0\], hộp bao (bounding box), neo (anchor\_preset), hướng co giãn (flex\_direction), khoảng đệm (padding, gap). | Đảm bảo vị trí tương quan không gian chính xác, không bị chồng đè, độc lập hoàn toàn với độ phân giải màn hình. | Tự quyết định cấu trúc cây node hiển thị tối ưu trong engine (ví dụ: chọn giữa MarginContainer hay cấu trúc lồng VBoxContainer). |
| **Ngữ nghĩa & Ý đồ** | Nhãn vai trò (role: "hud\_health", "cta\_button", "inventory\_slot"), ý đồ (intent: "open\_inventory", "start\_game"), tags tùy biến. | Cung cấp ngữ cảnh trừu tượng rõ ràng về mục đích của phần tử để AI hiểu ý người dùng. | Tự suy luận loại node chuyên dụng tương ứng (ví dụ: thấy role: "hud\_health" sẽ tạo TextureProgressBar thay vì vẽ hình chữ nhật thuần). |
| **Luồng trạng thái** | Danh sách dây nối Statecharts: node nguồn, khung đích, sự kiện (trigger: on\_click), điều kiện (guard), hành vi chuyển cảnh (action). | Chuẩn hóa logic điều hướng giữa các màn hình và trạng thái game. | Tự sinh mã gắn kết sự kiện trong engine (tạo signal GDScript pressed.connect(...) hoặc Event Callback C\#). |

Bản đặc tả xuất ra từ hệ thống bao gồm hai định dạng:

> 1. layout\_spec.guir.json: Tệp đặc tả máy đọc JSON chuẩn hóa, chứa đầy đủ tọa độ tương đối, cây phân cấp cấu trúc và các dây nối logic.  
> 2. layout\_summary.md: Bản tóm tắt phân cấp dạng Markdown súc tích, lược bỏ các thông số đồ họa chi tiết để nạp trực tiếp vào cửa sổ ngữ cảnh của Downstream Agent mà không làm lãng phí token.

Quy trình kiểm tra thị giác bằng Chỉ số tương đồng cấu trúc hình ảnh (SSIM):  
\\text{SSIM}(x, y) \= \\frac{(2\\mu\_x\\mu\_y \+ C\_1)(2\\sigma\_{xy} \+ C\_2)}{(\\mu\_x^\[span\_117\](start\_span)\[span\_117\](end\_span)\[span\_120\](start\_span)\[span\_120\](end\_span)2 \+ \\mu\_y^2 \+ C\_1)(\\sigma\_x^2 \+ \\sigma\_y^2 \+ C\_2)}  
Chỉ số SSIM \\ge 0.88 giữa ảnh render chuẩn xuất ra từ Web Canvas và ảnh chụp headless runtime từ game engine được định vị là một **tiêu chuẩn nghiệm thu độc lập** (Acceptance Test Criteria) mà Downstream Agent hoặc bộ chạy thử tự động sử dụng để tự đánh giá chất lượng biên dịch của mình, hoàn toàn không phải là logic runtime tích hợp bên trong Web Canvas.

## **9\. Kế hoạch đánh giá thực nghiệm và quản trị rủi ro**

### **Thiết kế chi tiết bộ thử nghiệm thực nghiệm (Spikes) cho 4 giả định G1 \- G4**

Đối với Spike 1 (Kiểm chứng G1 về khả năng đọc hiểu đa phương thức của tác tử), phương pháp thiết lập là xây dựng bộ dữ liệu đối chuẩn gồm 15 bố cục game điển hình (HUD thể loại MOBA, Menu chính nhập vai, Cửa hàng vật phẩm gacha). Từng bố cục được nạp cho tác tử LLM theo 3 điều kiện thử nghiệm: (A) Tệp JSON AST thuần túy; (B) Tệp ảnh PNG render từ canvas; (C) Tệp JSON AST tinh gọn kèm ảnh tổng quan đánh dấu chỉ mục ID. Tác tử phải trả lời bộ 20 câu hỏi truy vấn cấu trúc về liên kết điều hướng và quan hệ chứa đựng. Hệ thống đo lường tỷ lệ trả lời chính xác, độ trễ suy luận và số lượng token tiêu thụ. Tiêu chí đánh giá là điều kiện C (Hybrid) phải đạt độ chính xác \\ge 95\\% với mức tiêu thụ token thấp hơn 40\\% so với việc nạp JSON cây phân cấp chi tiết kiểu Figma.  
Đối với Spike 2 (Kiểm chứng G2 về độ ổn định thao tác và tính hội tụ công cụ MCP), phương pháp thiết lập là chuẩn bị 30 kịch bản yêu cầu tác tử sửa đổi bố cục liên tục qua MCP, từ thêm nút con, căn giữa thanh máu, đến chuyển hướng bố cục layout. Hệ thống theo dõi tỷ lệ lỗi cú pháp gọi công cụ, lỗi tọa độ trôi ra ngoài khung chứa (boundary overflow), và số vòng lặp mà tác tử cần để hoàn thành yêu cầu. Tiêu chí đánh giá yêu cầu tác tử hoàn thành tác vụ trong tối đa 2 lần gọi công cụ cho mỗi yêu cầu; tỷ lệ lỗi trôi tọa độ đạt 0\\%; hệ thống xử lý tự phục hồi giải quyết thành công 100\\% các lỗi sai tham số ở lần thử lại đầu tiên.  
Đối với Spike 3 (Kiểm chứng G3 về tính đầy đủ của bản đặc tả GUIR cho Downstream Engine), phương pháp thiết lập là lấy 10 bản đặc tả GUIR xuất ra từ hệ thống, chuyển giao trực tiếp cho một Downstream Agent độc lập đang kết nối với godot-mcp (Godot 4.3) và unity-mcp (Unity 6 / UI Toolkit) mà không cung cấp lịch sử trò chuyện trước đó. Hệ thống đo lường xem Downstream Agent có tạo được scene hoàn chỉnh, biên dịch không lỗi và gắn đúng tín hiệu (Signals/Events) dựa trên thông tin trong GUIR hay không. Tiêu chí đánh giá yêu cầu 100\\% scene biên dịch thành công; tất cả các dây nối luồng được ánh xạ chuẩn xác thành hàm sự kiện; chỉ số hình ảnh \\text{SSIM} \\ge 0.88 khi đối chiếu ảnh chụp runtime.  
Đối với Spike 4 (Kiểm chứng G4 về tính toàn vẹn khi Người và Máy cùng chỉnh sửa), phương pháp thiết lập là tạo môi trường kiểm thử tự động giả lập: một kịch bản người dùng liên tục kéo thả chuột (sinh ra 10 sự kiện di chuyển vị trí mỗi giây trên Web UI), đồng thời một tác tử AI gọi công cụ frame\_batch\_mutate để đổi tên, thay màu nền và chèn thêm 5 node con vào cùng một khung hình. Hệ thống đo lường số lượng xung đột dữ liệu, độ trượt khung hình của giao diện web và thời gian hai phía đạt trạng thái nhất quán cuối cùng. Tiêu chí đánh giá yêu cầu không xảy ra hiện tượng mất mát dữ liệu (zero data loss); giao diện người dùng không bị khóa quá 16\\text{ms} (duy trì \\ge 60 FPS); trạng thái đồng nhất hoàn toàn giữa client và server trong vòng \< 200\\text{ms} sau khi tác tử hoàn tất giao dịch.

### **Ma trận Quản trị Rủi ro Kỹ thuật**

| Rủi ro kỹ thuật | Mức độ tác động | Khả năng xảy ra | Biện pháp giảm thiểu kiến trúc |
| :---- | :---- | :---- | :---- |
| **Bùng nổ Token Context Window** khi Scene Graph có hàng trăm phần tử phức tạp. | Cao | Cao | Triển khai cơ chế phân tách: Công cụ overview chỉ trả về metadata; nén cây JSON thành định dạng phẳng; sử dụng Markdown Outline cho các truy vấn tổng quát. |
| **Agent ảo tưởng tọa độ tuyệt đối**, đặt các phần tử đè lên nhau hoặc trôi ra ngoài màn hình. | Cao | Trung bình | Ép buộc sử dụng các thuộc tính neo trừu tượng (anchor\_preset) và Container bố cục co giãn (Flex Layout) thay vì cho phép nhập tọa độ pixel tuyệt đối. |
| **Tranh chấp khóa giữa thao tác Người và AI** dẫn đến cảm giác giật cục trên Web UI. | Trung bình | Cao | Áp dụng cơ chế Khóa mềm theo cấp độ node: Khi Agent bắt đầu cập nhật một cụm node, cụm đó hiển thị viền cảnh báo và tạm khóa kéo thả chuột trong vài trăm mili-giây. |
| **Thay đổi phiên bản giao thức MCP** giữa các client khác nhau (Cursor, Claude Desktop, Antigravity). | Trung bình | Trung bình | Xây dựng tầng tương thích giao vận kép: Hỗ trợ song song cả chuẩn giao vận stdio và chuẩn mới Streamable HTTP kèm cơ chế tự động đàm phán phiên bản. |

## **10\. Lộ trình triển khai sản phẩm khả dụng tối thiểu (MVP)**

Lộ trình phát triển được thiết lập trong khung thời gian 14 tuần, phân chia thành bốn giai đoạn nối tiếp với các mốc bàn giao kỹ thuật rõ ràng:

| Giai đoạn | Khung thời gian | Trọng tâm kỹ thuật | Kết quả bàn giao chính (Milestones) |
| :---- | :---- | :---- | :---- |
| **Giai đoạn 1** | Tuần 1 – Tuần 4 | Nền tảng Canvas lõi, Scene Graph và Định dạng GUIR | Xây dựng môi trường web với React và React Flow; hỗ trợ vẽ các hình học và linh kiện cơ bản (Rectangle, Button, Label, Container); tích hợp cơ chế neo hình học (Anchor Presets); hoàn thiện bộ đọc/ghi JSON GUIR v1.0.0. Người dùng tạo được nhiều khung hình, chỉnh sửa trực quan và lưu trữ tệp đặc tả. |
| **Giai đoạn 2** | Tuần 5 – Tuần 8 | Máy chủ MCP Server và Hệ thống Dây nối Statecharts | Phát triển máy chủ MCP độc lập trên Node.js hỗ trợ cả stdio và Streamable HTTP; triển khai danh mục 7 công cụ MCP cốt lõi kèm cơ chế tự phục hồi lỗi; phát triển tính năng Dây nối ngữ nghĩa (Semantic Wires) hỗ trợ cấu hình trigger, guard và action. Tác tử AI bắt đầu tạo được layout và liên kết các khung qua MCP. |
| **Giai đoạn 3** | Tuần 9 – Tuần 11 | Đồng bộ hóa Thời gian thực và Thực nghiệm Spikes G1 \- G4 | Xây dựng máy chủ đồng bộ hóa WebSocket trung tâm sử dụng JSON Patch (RFC 6902\) và Vector Clocks; thiết lập cơ chế khóa mềm chống tranh chấp; chạy bộ thử nghiệm tự động cho cả 4 Spikes. Toàn bộ các chỉ số kiểm chứng của G1, G2, G3 và G4 đạt ngưỡng Pass; hoàn thiện khả năng đồng tác vụ mượt mà giữa người và AI. |
| **Giai đoạn 4** | Tuần 12 – Tuần 14 | Chuẩn hóa Đặc tả GUIR, Handoff Contract và Thử nghiệm Alpha | Hoàn thiện công cụ xuất GUIR định dạng JSON và Markdown súc tích; xây dựng bộ prompt mẫu và hợp đồng chuyển giao (Handoff Contract) cho Downstream Agent; kiểm tra đối chiếu SSIM độc lập giữa canvas web và ảnh chụp headless runtime; tiến hành thử nghiệm Alpha với 5 lập trình viên indie. |

Quy trình 14 tuần này đảm bảo hệ thống MVP khép kín được xác thực hoàn chỉnh: người dùng chỉ cần đưa ra ý tưởng sơ bộ, tác tử AI phác thảo cấu trúc trực quan trên web, hai bên cùng tinh chỉnh trong không gian làm việc vô tận, và cuối cùng bản đặc tả GUIR được bàn giao cho Downstream Agent với ranh giới trách nhiệm rõ ràng, chuẩn bị cho bản nâng cấp engine tiếp theo.

#### **Nguồn trích dẫn**

1\. MCP Registry | Figma MCP Server \- GitHub, https\://github.com/mcp/com.figma.mcp/mcp 2\. GitHub \- Coding-Solo/godot-mcp, https\://github.com/Coding-Solo/godot-mcp 3\. Simplifying Godot UI Development for All Levels \- Game Dev Artisan, https\://gamedevartisan.com/tutorials/understanding-godot-ui-control-nodes 4\. GitHub \- hi-godot/godot-ai: Production-grade MCP server and AI, https\://github.com/hi-godot/godot-ai 5\. Figma MCP Server: What It Does, Setup, and Limits (2026), https\://mcpverdict.com/mcp/servers/design/figma/ 6\. MCP server for full Godot 4.x engine control: 157 tools for AI ... \- GitHub, https\://github.com/tugcantopaloglu/godot-mcp 7\. Simple JavaScript Finite State Machines and Statecharts \- xstate, https\://xstate.js.org/docs-v3/ 8\. Migrate from uGUI to UI Toolkit \- Unity \- Manual, https\://docs.unity3d.com/6000.0/Documentation/Manual/UIE-Transitioning-From-UGUI.html 9\. Tools and prompts | Developer Docs, https\://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/ 10\. Unity MCP acts as a bridge between AI assistants and your ... \- GitHub, https\://github.com/CoplayDev/unity-mcp 11\. Unity UI Toolkit vs UGUI: 2025 Developer Guide \- Angry Shark Studio, https\://www\.angry-shark-studio.com/blog/unity-ui-toolkit-vs-ugui-2025-guide/ 12\. tldraw: Infinite Canvas SDK for React \- Pricing and licensing, https\://tldraw.dev/pricing 13\. Introduction to state machines and statecharts, https\://stately.ai/blog/2021-10-02-intro-fsm-sc 14\. Raunaksplanet/godot-mcp-server \- GitHub, https\://github.com/Raunaksplanet/godot-mcp-server 15\. Penpot: The open-source design platform for teams., https\://penpot.app/ 16\. Penpot for Designers: Open-Source Design Freedom \- Hack Design, https\://www\.hackdesign.org/toolkit/penpot/ 17\. Best Open Source Whiteboard Tools in 2026, https\://www\.opensourcealternatives.to/blog/best-open-source-whiteboard-tools 18\. Best Open-Source Whiteboard Tools in 2026: Excalidraw vs tldraw, https\://meetrix.io/blogs/open-source-whiteboard-tools/ 19\. What Is JSON Patch? \- Hacker News, https\://news.ycombinator.com/item?id=31301627 20\. React Flow: Build Visual Workflows Easily | PDF \- Scribd, https\://www\.scribd.com/document/963742525/React-Flow 21\. Is anyone familiar with subflows in reactflow (graph viz lib) \- Reddit, https\://www\.reddit.com/r/react/comments/zroa2v/is\_anyone\_familiar\_with\_subflows\_in\_reactflow/ 22\. ProseMirror \+ CRDT's? \- Uncategorized, https\://discuss.prosemirror.net/t/prosemirror-crdts/1190 23\. Design patterns for betting app developers \- Ably Realtime, https\://ably.com/blog/design-patterns-betting-apps 24\. Transports \- What is the Model Context Protocol (MCP)?, https\://modelcontextprotocol.io/specification/2025-03-26/basic/transports 25\. MCP Transport Comparison: stdio vs SSE vs Streamable HTTP, https\://gingerlabs.ai/blog/mcp-transport-comparison 26\. MCP server transports | Docs \- IBM Bob, https\://bob.ibm.com/docs/ide/configuration/mcp/server-transports 27\. Releasing React Flow 10 and React Flow Pro \- xyflow, https\://xyflow.com/blog/react-flow-v10 28\. Image Difference with OpenCV and Python \- PyImageSearch, https\://pyimagesearch.com/2017/06/19/image-difference-with-opencv-and-python/ 29\. Similarity check (PNSR and SSIM) on the GPU \- OpenCV, https\://docs.opencv.org/4.13.0/dd/d3d/tutorial\_gpu\_basics\_similarity.html 30\. Godot-MCP \- Godot Asset Library, https\://godotengine.org/asset-library/asset/5245 31\. Unity MCP Server: Connect Claude Code, Cursor, and Other AI Agents, https\://unity.com/blog/unity-ai-mcp-how-to-get-started