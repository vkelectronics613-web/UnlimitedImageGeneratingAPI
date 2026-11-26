/**
 * Client-Side Generative Engine
 * Runs completely offline using HTML5 canvas procedural synthesis.
 * Zero network requests, zero API keys required.
 */
export async function generateOfflineImage(prompt: string): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed = (seed * 31 + prompt.charCodeAt(i)) >>> 0;
  }

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Base background
  const h1 = Math.floor(random() * 360);
  const h2 = (h1 + 40 + Math.floor(random() * 80)) % 360;
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, `hsl(${h1}, 75%, 15%)`);
  grad.addColorStop(1, `hsl(${h2}, 85%, 5%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Geometric & procedural generative elements
  const shapeCount = 25 + Math.floor(random() * 25);
  for (let i = 0; i < shapeCount; i++) {
    const x = random() * 1024;
    const y = random() * 1024;
    const r = 40 + random() * 180;
    const shapeHue = (h1 + Math.floor(random() * 120)) % 360;

    const radGrad = ctx.createRadialGradient(x, y, 5, x, y, r);
    radGrad.addColorStop(0, `hsla(${shapeHue}, 80%, 60%, 0.6)`);
    radGrad.addColorStop(1, `hsla(${shapeHue}, 90%, 20%, 0)`);

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Linear fractal wave lines
  ctx.lineWidth = 2;
  for (let wave = 0; wave < 15; wave++) {
    ctx.strokeStyle = `hsla(${(h2 + wave * 10) % 360}, 90%, 70%, 0.35)`;
    ctx.beginPath();
    let prevY = 512 + (random() - 0.5) * 300;
    ctx.moveTo(0, prevY);
    for (let x = 0; x <= 1024; x += 32) {
      const y = 512 + Math.sin(x * 0.01 + wave) * 120 + (random() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Central emblem badge
  ctx.save();
  ctx.shadowColor = `hsl(${h1}, 100%, 50%)`;
  ctx.shadowBlur = 30;
  ctx.fillStyle = `rgba(15, 23, 42, 0.75)`;
  ctx.strokeStyle = `hsl(${h1}, 90%, 65%)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(162, 780, 700, 120, 24);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Typography overlay
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  const displayPrompt = prompt.length > 38 ? prompt.substring(0, 35) + "..." : prompt;
  ctx.fillText(`"${displayPrompt}"`, 512, 835);

  ctx.fillStyle = `hsl(${h2}, 80%, 75%)`;
  ctx.font = "600 20px monospace";
  ctx.fillText("Offline Generative Engine • Zero-Network", 512, 875);

  return canvas.toDataURL("image/png");
}
