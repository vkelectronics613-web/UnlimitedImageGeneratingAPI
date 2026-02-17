import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PromptInput from "@/components/PromptInput";
import ImagePreview from "@/components/ImagePreview";
import ImageHistory from "@/components/ImageHistory";
import LoadingAnimation from "@/components/LoadingAnimation";
import type { HistoryItem } from "@/components/ImageHistory";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_IMAGES: HistoryItem[] = [];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ url: string; prompt: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(SAMPLE_IMAGES);
  const { toast } = useToast();

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setCurrentImage(null);

    try {
      // TODO: Replace with actual Lovable Cloud edge function call
      // For now, simulate with a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Placeholder - will be replaced with real AI generation
      const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt,
        imageUrl: placeholderUrl,
        createdAt: new Date(),
      };

      setCurrentImage({ url: placeholderUrl, prompt });
      setHistory((prev) => [newItem, ...prev].slice(0, 12));

      toast({
        title: "Image generated!",
        description: "Your image is ready to view and download.",
      });
    } catch {
      toast({
        title: "Generation failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              Transform your words into stunning visuals with AI
            </p>
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
            Powered by AI · Built with Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
