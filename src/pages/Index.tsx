import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PromptInput from "@/components/PromptInput";
import ImagePreview from "@/components/ImagePreview";
import ImageHistory from "@/components/ImageHistory";
import LoadingAnimation from "@/components/LoadingAnimation";
import type { HistoryItem } from "@/components/ImageHistory";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "imageforge_history";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ url: string; prompt: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota
    }
  }, [history]);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setCurrentImage(null);

    let imageUrl: string | null = null;
    let engine = "Direct AI";

    // 1. Try Pollinations / Flux free unlimited AI generation first (Real photorealistic images, zero API key)
    try {
      const encodedPrompt = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      const testUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;
      
      // Verify image responds
      const probe = await fetch(testUrl, { method: "HEAD", signal: AbortSignal.timeout(12000) });
      if (probe.ok) {
        imageUrl = testUrl;
        engine = "Pollinations / Flux Engine";
      }
    } catch {
      // Cloud probe failed, fallback to Supabase
    }

    // 2. If Pollinations probe timed out or failed, try your Supabase Edge Function
    if (!imageUrl) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt },
        });
        if (!error && data?.imageUrl) {
          imageUrl = data.imageUrl;
          engine = "Supabase / Gemini";
        }
      } catch {
        // Fallback
      }
    }

    // 3. Fallback direct image URL if head probe was blocked by CORS
    if (!imageUrl) {
      const encodedPrompt = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;
      engine = "Direct AI Stream";
    }

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      prompt,
      imageUrl,
      createdAt: new Date(),
    };

    setCurrentImage({ url: imageUrl, prompt });
    setHistory((prev) => [newItem, ...prev].slice(0, 16));

    toast({
      title: "Real AI Image Generated!",
      description: `Rendered with ${engine}. High-resolution visual output ready.`,
    });

    setIsLoading(false);
  }, [toast]);

  const handleSelectHistory = (item: HistoryItem) => {
    setCurrentImage({ url: item.imageUrl, prompt: item.prompt });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        {/* Header */}
        <header className="pt-12 pb-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                ImageForge
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Transform your words into real photorealistic AI visuals • 100% Free &amp; Unlimited
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                <Key className="h-4 w-4 mr-2" />
                API Dashboard
              </Button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                <Zap className="h-3 w-3 text-amber-500" />
                Real AI Photorealism Active
              </div>
            </div>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="px-4 pb-16 space-y-12">
          {/* Prompt Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
          </motion.section>

          {/* Image Display */}
          <section>
            {isLoading && <LoadingAnimation />}
            {!isLoading && currentImage && (
              <ImagePreview imageUrl={currentImage.url} prompt={currentImage.prompt} />
            )}
          </section>

          {/* History */}
          {history.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ImageHistory images={history} onSelect={handleSelectHistory} />
            </motion.section>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-border">
          <p className="text-sm text-muted-foreground font-mono">
            ImageForge • Open Source Real AI Image Generation
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
