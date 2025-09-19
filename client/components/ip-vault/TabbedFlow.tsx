import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import StoryAnimation from "@/components/ip-vault/StoryAnimation";

export default function TabbedFlow() {
  const [type, setType] = useState<"vault" | "tee">("vault");
  const [sound, setSound] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);
  const [playSignal, setPlaySignal] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;
    introTweenRef.current?.kill();
    introTweenRef.current = gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 10,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    });
    return () => {
      introTweenRef.current?.kill();
    };
  }, [type]);

  return (
    <section className="bg-black text-white flex flex-col items-center justify-center min-h-screen p-8 space-y-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-center">IP Vault Flow</h1>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setType("vault")}
          className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${
            type === "vault"
              ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
              : "bg-blue-600/40 hover:bg-blue-600 focus:ring-blue-300"
          }`}
        >
          IP Vault
        </button>
        <button
          onClick={() => setType("tee")}
          className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${
            type === "tee"
              ? "bg-green-500 hover:bg-green-600 focus:ring-green-400"
              : "bg-green-600/40 hover:bg-green-600 focus:ring-green-300"
          }`}
        >
          IP Vault + TEE
        </button>
        <button
          onClick={() => setPlaySignal(String(Date.now()))}
          className="px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 bg-violet-500 hover:bg-violet-600 focus:ring-violet-300"
        >
          Play
        </button>
        <button
          onClick={() => setSound((s) => !s)}
          className={`px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${
            sound
              ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-300"
              : "bg-gray-600/40 hover:bg-gray-600 focus:ring-gray-300"
          }`}
          aria-pressed={sound}
        >
          SFX: {sound ? "On" : "Off"}
        </button>
      </div>

      <div ref={containerRef} className="w-full space-y-8">
        <StoryAnimation
          mode={type}
          event={playSignal}
          sound={sound}
          fullHeight
        />
      </div>
    </section>
  );
}
