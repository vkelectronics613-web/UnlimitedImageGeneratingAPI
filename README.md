# 🎨 ImageForge — Unlimited AI Image Generation Platform & API

> A high-performance, full-stack AI image generation web application and developer REST API engine.

[![Live Demo](https://img.shields.io/badge/Live_App-promptpainter.lovable.app-blue?style=flat&logo=safari)](https://promptpainter.lovable.app)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Live Application: **[promptpainter.lovable.app](https://promptpainter.lovable.app)**

---

## ✨ Features

- **Prompt to Image Engine:** High-fidelity AI image generation from natural language prompts.
- **Developer API Key Management:** Built-in dashboard to generate, inspect, and manage API keys with quota and rate tracking.
- **REST API Endpoint:** Programmatic image generation endpoint for developers and external integrations.
- **Image History & Storage:** Persisted gallery with instant view, prompt inspection, and full-resolution download.
- **Modern Responsive UI:** Glassmorphism interface styled with Tailwind CSS, Radix UI primitives, and Framer Motion animations.

---

## 🚀 Public API Usage

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
    "api_key": "YOUR_API_KEY",
    "prompt": "a cybernetic fox running through a neon Tokyo street, 8k resolution cinematic"
  }'
```

### Request Example (JavaScript / TypeScript)
```javascript
const response = await fetch("https://tonuctamrfsvulxgfjrs.supabase.co/functions/v1/api-generate-image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: "YOUR_API_KEY",
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
    "api_key": "YOUR_API_KEY",
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

The app will be running at `http://localhost:5173`.

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
│       ├── generate-image/      # In-app image generation edge function
│       └── api-generate-image/  # Developer REST API edge function
└── .env                  # Environment configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
