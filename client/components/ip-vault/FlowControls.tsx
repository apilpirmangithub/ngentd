import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface FlowControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  disablePrev: boolean;
  disableNext: boolean;
}

export function FlowControls({
  onPrev,
  onNext,
  onTogglePlay,
  isPlaying,
  disablePrev,
  disableNext,
}: FlowControlsProps) {
  return (
    <div id="walkthrough" className="flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={disablePrev}
        aria-label="Prev"
      >
        <ChevronLeft className="mr-1" /> Prev
      </Button>
      <Button
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause Walkthrough" : "Play Walkthrough"}
      >
        {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}{" "}
        {isPlaying ? "Pause" : "Play Walkthrough"}
      </Button>
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={disableNext}
        aria-label="Next"
      >
        Next <ChevronRight className="ml-1" />
      </Button>
    </div>
  );
}
