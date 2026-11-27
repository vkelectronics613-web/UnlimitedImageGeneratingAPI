import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, mcp-session-id",
};

const MCP_TOOLS = [
  {
    name: "generate_image",
    description: "Generates high-resolution, photorealistic AI images from a descriptive prompt with zero censorship and unlimited quota.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Detailed description of the image to generate (e.g. 'cinematic action shot of a warrior with neon lighting, 8k resolution')."
        },
        width: {
          type: "number",
          description: "Width of the output image in pixels (default: 1024).",
          default: 1024
        },
        height: {
          type: "number",
          description: "Height of the output image in pixels (default: 1024).",
          default: 1024
        },
        seed: {
          type: "number",
          description: "Optional random seed integer for reproducible generation."
        }
      },
      required: ["prompt"]
    }
  },
  {
    name: "get_service_status",
    description: "Returns the health and operational status of the Unlimited Image Generating MCP Server.",
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

  // Support GET discovery for MCP server capabilities and health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify(
        {
          name: "unlimited-image-generating-mcp",
          version: "1.0.0",
          protocolVersion: "2024-11-05",
          description: "Public Model Context Protocol (MCP) server for Unlimited AI Image Generation.",
          tools: MCP_TOOLS,
          endpoint: "https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image",
          status: "online"
        },
        null,
        2
      ),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const rawBody = await req.text();
    let body: any = {};
    if (rawBody && rawBody.trim()) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = { prompt: rawBody };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 1. MCP (Model Context Protocol) JSON-RPC 2.0 Handler
    // ─────────────────────────────────────────────────────────────
    if (body.jsonrpc === "2.0" || body.method) {
      const { id, method, params } = body;

      if (method === "initialize") {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: { listChanged: false }
              },
              serverInfo: {
                name: "unlimited-image-generating-mcp",
                version: "1.0.0"
              }
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (method === "tools/list") {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: { tools: MCP_TOOLS }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (method === "tools/call") {
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
          const encodedPrompt = encodeURIComponent(String(prompt).trim());
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Image generated successfully for prompt: "${prompt}"\nURL: ${imageUrl}`
                  },
                  {
                    type: "image",
                    data: imageUrl,
                    mimeType: "image/jpeg"
                  }
                ],
                isError: false,
                metadata: { prompt, width, height, seed, imageUrl }
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
                    text: "Unlimited Image Generating MCP Server is online and operational."
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
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Standard REST API Handler (supports both API key and direct prompt)
    // ─────────────────────────────────────────────────────────────
    const { api_key, prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional API key validation when api_key is passed
    if (api_key) {
      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("*")
        .eq("key", api_key)
        .single();

      if (!keyError && keyData) {
        await supabase
          .from("api_keys")
          .update({
            images_used: (keyData.images_used || 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", keyData.id);
      }
    }

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

    return new Response(
      JSON.stringify({
        status: "success",
        imageUrl,
        prompt: prompt.trim(),
        seed,
        usage: {
          images_used: 1,
          images_limit: "unlimited",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
