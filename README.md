# 🎨 ImageForge — Unlimited AI Image Generation Platform, REST API & Public MCP Server

> A high-performance, full-stack AI image generation web application, developer REST API, and public **Model Context Protocol (MCP)** server for AI agents.

[![Live Demo](https://img.shields.io/badge/Live_App-promptpainter.lovable.app-blue?style=flat&logo=safari)](https://promptpainter.lovable.app)
[![MCP Server](https://img.shields.io/badge/MCP_Server-Public_Endpoint-success?style=flat&logo=anthropic)](https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Live Application: **[promptpainter.lovable.app](https://promptpainter.lovable.app)**

---

## ⚡ Public Model Context Protocol (MCP) Server

ImageForge natively exposes a **public, remote Model Context Protocol (MCP)** server endpoint compliant with the official 2024-11-05 JSON-RPC 2.0 specification. 

Any AI agent, Claude desktop client, Cursor, or Antigravity workspace can connect directly to this public server without installing local packages.

### Public MCP Server Configuration

Add this to your `claude_desktop_config.json`, `mcp.json`, or Agent settings:

```json
{
  "mcpServers": {
    "unlimited-image-forge": {
      "url": "https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image",
      "transport": "http"
    }
  }
}
```

### Available MCP Tools

| Tool Name | Description | Arguments |
| :--- | :--- | :--- |
| `generate_image` | Generates photorealistic AI images with zero censorship & unlimited quota. | `prompt` *(string, required)*, `width` *(int)*, `height` *(int)*, `seed` *(int)* |
| `get_service_status` | Checks health and operational state of the generation engine. | *None* |

---

## 🚀 Public REST API Usage

Developers can integrate ImageForge into their own scripts, applications, and bots.

### Endpoint
```http
POST https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image
Content-Type: application/json
```

### Request Example (`curl`)
```bash
curl -X POST https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cybernetic fox running through a neon Tokyo street, 8k resolution cinematic"
  }'
```

### Request Example (JavaScript / TypeScript)
```javascript
const response = await fetch("https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "a cybernetic fox in a neon city, 8k cinematic lighting"
  })
});

const data = await response.json();
console.log("Image URL:", data.imageUrl);
```

### Request Example (Python)
```python
import requests

url = "https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image"
payload = {
    "prompt": "hyper-realistic mechanical falcon perched on a glass skyscraper, octane render"
}

res = requests.post(url, json=payload)
data = res.json()
print("Generated Image:", data.get("imageUrl"))
```

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/vkelectronics613-web/UnlimitedImageGeneratingAPI.git
cd UnlimitedImageGeneratingAPI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```

---

## 📂 Architecture

```text
UnlimitedImageGeneratingAPI/
├── src/
│   ├── components/       # Prompt input, history gallery, loading states, UI
│   ├── pages/
│   │   ├── Index.tsx     # Main generation studio
│   │   ├── Dashboard.tsx # API key manager and usage analytics
│   │   └── Auth.tsx      # User authentication flow
│   └── integrations/     # Supabase backend client
├── supabase/
│   └── functions/
│       └── api-generate-image/  # Dual REST API & Public MCP JSON-RPC 2.0 Server
└── server.js             # Local offline fallback server
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
