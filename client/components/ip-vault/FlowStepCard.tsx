import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface FlowStepCardProps {
  index: number;
  title: string;
  description: string;
  active: boolean;
  icon: ReactNode;
  onClick?: () => void;
}

export function FlowStepCard({
  index,
  title,
  description,
  active,
  icon,
  onClick,
}: FlowStepCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={false}
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? "0 10px 30px hsl(var(--primary) / 0.25)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      className={cn(
        "group relative w-full rounded-xl border p-5 text-left transition",
        "bg-card/70 hover:bg-card ring-1 ring-inset ring-border/60",
        active ? "border-primary/50 ring-primary/30" : "border-border/70",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative flex size-10 items-center justify-center rounded-lg",
            active
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "bg-muted/60 text-muted-foreground ring-1 ring-border/60",
          )}
        >
          <span className="absolute -top-2 -left-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-0.5 shadow">
            {index}
          </span>
          <div className="[&_svg]:size-5">{icon}</div>
          {active && (
            <motion.span
              layoutId="activeHalo"
              className="pointer-events-none absolute -inset-2 rounded-xl bg-primary/10"
              aria-hidden
            />
          )}
        </div>
        <div className="space-y-1.5">
          <h3
            className={cn(
              "font-semibold leading-none tracking-tight",
              active ? "text-foreground" : "text-foreground",
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {active && (
        <motion.div
          layoutId="activeBar"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent"
        />
      )}
    </motion.button>
  );
}
