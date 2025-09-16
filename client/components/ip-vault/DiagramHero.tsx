import { AnimatePresence, motion } from "framer-motion";

const IMAGES = [
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F427e29a008e349e999f4f427937b403c%2F02c4af63ed6143d19a52cb1c0619c073?format=webp&width=1200",
    alt: "IP Vault diagram",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F427e29a008e349e999f4f427937b403c%2F2edc3f1fbe7340c2abcf10d30e621d53?format=webp&width=1200",
    alt: "IP Vault + TEE diagram",
  },
];

export function DiagramHero({ active }: { active: number }) {
  const idx = active % IMAGES.length;
  const current = IMAGES[idx];

  return (
    <div className="relative mx-auto mt-2 w-full max-w-5xl">
      <div
        className="absolute -inset-6 rounded-2xl bg-[radial-gradient(1200px_300px_at_50%_0%,hsl(75_95%_65%_/_0.25),transparent_60%)]"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-black/60 shadow-[0_0_0_1px_hsl(var(--border)/0.3),0_10px_40px_hsl(75_95%_65%_/_0.15)]">
        <div className="aspect-[16/9] w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.alt}
              className="h-full w-full object-contain"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
