import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="min-h-[120px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none text-base p-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        variant="generate"
        size="lg"
        disabled={!prompt.trim() || isLoading}
        className="w-full h-12 text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles />
            Generate Image
          </>
        )}
      </Button>
    </form>
  );
};

export default PromptInput;
