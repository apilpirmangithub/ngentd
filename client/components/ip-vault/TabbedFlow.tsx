import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { User2, Lock, Cpu, Check } from "lucide-react";

function Node({ label, color = "bg-gray-700", extra = "", icon }: { label: string; color?: string; extra?: string; icon: JSX.Element }) {
  return (
    <div className={`flex flex-col items-center justify-center w-44 h-32 rounded-2xl shadow-lg ${color} ${extra}`}>
      <div className="mb-2">{icon}</div>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function Arrow({ text = "", play = true }: { text?: string; play?: boolean }) {
  const barRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!barRef.current || !play) return;
    const dot = barRef.current.querySelector(".dot");
    if (!dot) return;
    const w = 96; // w-24 (6rem)
    const tl = gsap.fromTo(
      dot,
      { x: 0, opacity: 0 },
      { x: w, opacity: 1, duration: 1.2, ease: "none", repeat: -1 }
    );
    return () => tl.kill();
  }, [play]);
  return (
    <div className="flex flex-col items-center">
      <div ref={barRef} className="relative w-24 h-1 bg-white/80 rounded-full overflow-hidden">
        <div className="dot absolute top-1/2 -translate-y-1/2 left-0 size-2 rounded-full bg-white" />
      </div>
      {text ? <span className="text-sm mt-2 opacity-90">{text}</span> : null}
    </div>
  );
}

export default function TabbedFlow() {
  const [type, setType] = useState<"vault" | "tee">("vault");
  const flowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!flowRef.current) return;
    const targets = flowRef.current.querySelectorAll("div");
    gsap.from(targets, { opacity: 0, scale: 0.88, stagger: 0.12, duration: 0.5, ease: "power2.out" });
  }, [type]);

  const Flow = useMemo(() => {
    if (type === "vault") {
      return (
        <>
          <div className="flex items-center space-x-8">
            <Node label="IP Owner" color="bg-blue-500" icon={<User2 className="size-7" />} />
            <Arrow text="Secure Upload" />
            <Node label="Vault" color="bg-yellow-400 text-black" icon={<Lock className="size-7" />} />
            <Arrow text="Secure Download" />
            <Node label="IP Buyer" color="bg-white text-black" icon={<User2 className="size-7" />} />
          </div>
          <div className="mt-6 flex justify-around w-full text-sm">
            <div className="p-3 bg-gray-800/80 rounded-lg inline-flex items-center gap-2">
              <b>Write Access:</b> <span>Ownership of IP</span> <Check className="size-4 text-emerald-400" />
            </div>
            <div className="p-3 bg-gray-800/80 rounded-lg inline-flex items-center gap-2">
              <b>Read Access:</b> <span>Valid IP License</span> <Check className="size-4 text-emerald-400" />
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex items-center space-x-8">
          <Node label="IP Owner" color="bg-blue-500" icon={<User2 className="size-7" />} />
          <Arrow text="Secure Upload" />
          <Node label="Vault" color="bg-yellow-400 text-black" icon={<Lock className="size-7" />} />
          <Arrow text="Secure Download" />
          <Node label="TEE" color="bg-green-400 text-black" icon={<Cpu className="size-7" />} />
          <Arrow />
          <Node label="IP Buyer" color="bg-white text-black" icon={<User2 className="size-7" />} />
        </div>
        <div className="mt-6 flex justify-around w-full text-sm">
          <div className="p-3 bg-gray-800/80 rounded-lg inline-flex items-center gap-2">
            <b>Write Access:</b> <span>Ownership of IP</span> <Check className="size-4 text-emerald-400" />
          </div>
          <div className="p-3 bg-gray-800/80 rounded-lg inline-flex items-center gap-2">
            <b>Read Access:</b> <span>Valid IP License</span> <Check className="size-4 text-emerald-400" /> <span>Valid Remote Attestation</span> <Check className="size-4 text-emerald-400" />
          </div>
        </div>
      </>
    );
  }, [type]);

  return (
    <section className="bg-black text-white flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-10 rounded-2xl border border-white/10">
      <h1 className="text-3xl font-bold text-center">IP Vault Flow</h1>

      <div className="flex space-x-4">
        <button onClick={() => setType("vault")} className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${type==='vault' ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' : 'bg-blue-600/40 hover:bg-blue-600 focus:ring-blue-300'}`}>IP Vault</button>
        <button onClick={() => setType("tee")} className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${type==='tee' ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 'bg-green-600/40 hover:bg-green-600 focus:ring-green-300'}`}>IP Vault + TEE</button>
      </div>

      <div ref={flowRef} className="w-full max-w-5xl mt-2 flex flex-col items-center">
        {Flow}
      </div>
    </section>
  );
}
