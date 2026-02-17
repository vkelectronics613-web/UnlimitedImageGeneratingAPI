import { motion } from "framer-motion";

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
}

interface ImageHistoryProps {
  images: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const ImageHistory = ({ images, onSelect }: ImageHistoryProps) => {
  if (images.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="font-mono text-lg text-muted-foreground mb-4 tracking-wider uppercase">
        Recent Generations
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelect(item)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:glow-primary"
          >
            <img
              src={item.imageUrl}
              alt={item.prompt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
              <p className="text-xs text-foreground/80 font-mono line-clamp-2">
                {item.prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;
export type { HistoryItem };
