import { motion } from "framer-motion";

const LoadingAnimation = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="aspect-square rounded-xl border border-border bg-card overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{
                    y: [-8, 8, -8],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-sm text-muted-foreground tracking-wider uppercase">
              Creating your image...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
