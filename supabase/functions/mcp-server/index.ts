import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, mcp-session-id",
};

const MCP_TOOLS = [
  {
    name: "generate_image",
    description: "Generates high-resolution, photorealistic or artistic images from a descriptive prompt with zero censorship and unlimited quota.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Detailed description of the image to generate (e.g. 'cinematic action shot of a warrior with neon lighting, 8k resolution, octane render')."
        },
        width: {
          type: "number",
          description: "Width of the output image in pixels. Defaults to 1024.",
          default: 1024
        },
        height: {
          type: "number",
          description: "Height of the output image in pixels. Defaults to 1024.",
          default: 1024
        },
        seed: {
          type: "number",
          description: "Optional numeric seed for reproducible generation."
        }
      },
      required: ["prompt"]
    }
  },
  {
    name: "get_service_status",
    description: "Returns the health and operational status of the Unlimited Image Generation engine and public MCP server.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle SSE (Server-Sent Events) or HTTP POST JSON-RPC 2.0 (Model Context Protocol standard)
  if (req.method === "GET") {
    // Return server capabilities and schema info
    return new Response(
      JSON.stringify({
        name: "unlimited-image-generating-mcp",
        version: "1.0.0",
        protocolVersion: "2024-11-05",
        description: "Public Model Context Protocol (MCP) server for Unlimited AI Image Generation.",
        tools: MCP_TOOLS,
        endpoint: "https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/mcp-server",
        status: "active"
      }, null, 2),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    // Standard MCP Protocol Dispatcher
    switch (method) {
      case "initialize":
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {
                  listChanged: false
                }
              },
              serverInfo: {
                name: "unlimited-image-generating-mcp",
                version: "1.0.0"
              }
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "tools/list":
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              tools: MCP_TOOLS
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (toolName === "generate_image") {
          const prompt = args.prompt;
          if (!prompt) {
            return new Response(
              JSON.stringify({
                jsonrpc: "2.0",
                id,
                error: { code: -32602, message: "Missing required argument 'prompt'" }
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const width = args.width || 1024;
          const height = args.height || 1024;
          const seed = args.seed || Math.floor(Math.random() * 1000000);
          const encodedPrompt = encodeURIComponent(prompt.trim());
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Image generated successfully for prompt: "${prompt}"\nImage URL: ${imageUrl}`
                  },
                  {
                    type: "image",
                    data: imageUrl,
                    mimeType: "image/jpeg"
                  }
                ],
                isError: false,
                metadata: {
                  prompt,
                  width,
                  height,
                  seed,
                  imageUrl
                }
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (toolName === "get_service_status") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: "Unlimited Image Generating MCP Server is online and operational. Ready for agent tool calls."
                  }
                ],
                isError: false
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Tool '${toolName}' not found.` }
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method '${method}' not supported.` }
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${err?.message || err}` }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
