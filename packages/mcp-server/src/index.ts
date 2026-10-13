import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { toolsDefinition, handleToolCall } from "./tools/index.js";

// Đảm bảo không có log nào rơi vào stdout làm hỏng giao thức JSON-RPC của MCP stdio
const originalLog = console.log;
console.log = (...args: any[]) => {
  console.error("[LudusGraph MCP STDERR LOG]:", ...args);
};

async function runStdioServer() {
  const server = new Server(
    {
      name: "ludusgraph-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolsDefinition,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await handleToolCall(
        request.params.name,
        (request.params.arguments as Record<string, unknown>) || {}
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                isError: true,
                error_code: "TOOL_EXECUTION_ERROR",
                message: error.message || String(error),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LudusGraph MCP Server running on stdio transport successfully.");
}

runStdioServer().catch((err) => {
  console.error("Fatal error running LudusGraph MCP server:", err);
  process.exit(1);
});
