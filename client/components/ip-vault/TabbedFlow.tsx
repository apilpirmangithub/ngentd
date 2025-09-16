import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import StoryAnimation from "@/components/ip-vault/StoryAnimation";

export default function TabbedFlow() {
  const [type, setType] = useState<"vault" | "tee">("vault");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 10,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, [type]);

  return (
    <section
      id="walkthrough"
      className="bg-black text-white flex flex-col items-center justify-center min-h-[70vh] p-8 space-y-6 rounded-2xl border border-white/10"
    >
      <h1 className="text-3xl font-bold text-center">IP Vault Flow</h1>
      <p className="text-sm text-white/70 text-center max-w-2xl">
        Pilih mode alur, lalu tekan Play. Lihat langkah berjalan di
        langkah-langkah di atas animasi.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => setType("vault")}
          className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${type === "vault" ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400" : "bg-blue-600/40 hover:bg-blue-600 focus:ring-blue-300"}`}
        >
          IP Vault
        </button>
        <button
          onClick={() => setType("tee")}
          className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${type === "tee" ? "bg-green-500 hover:bg-green-600 focus:ring-green-400" : "bg-green-600/40 hover:bg-green-600 focus:ring-green-300"}`}
        >
          IP Vault + TEE
        </button>
      </div>

      <div ref={containerRef} className="w-full">
        <StoryAnimation mode={type} />
      </div>
    </section>
  );
}
