import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

function Node({ label, color = "bg-gray-700", extra = "" }: { label: string; color?: string; extra?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center w-40 h-28 rounded-2xl shadow-lg ${color} ${extra}`}>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function Arrow({ text = "" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-1 bg-white animate-pulse" />
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
            <Node label="IP Owner" color="bg-blue-500" />
            <Arrow text="Secure Upload" />
            <Node label="Vault" color="bg-yellow-400 text-black" />
            <Arrow text="Secure Download" />
            <Node label="IP Buyer" color="bg-white text-black" />
          </div>
          <div className="mt-6 flex justify-around w-full text-sm">
            <div className="p-3 bg-gray-800/80 rounded-lg">
              <p><b>Write Access:</b> Ownership of IP ✅</p>
            </div>
            <div className="p-3 bg-gray-800/80 rounded-lg">
              <p><b>Read Access:</b> Valid IP License ✅</p>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex items-center space-x-8">
          <Node label="IP Owner" color="bg-blue-500" />
          <Arrow text="Secure Upload" />
          <Node label="Vault" color="bg-yellow-400 text-black" />
          <Arrow text="Secure Download" />
          <Node label="TEE" color="bg-green-400 text-black" />
          <Arrow />
          <Node label="IP Buyer" color="bg-white text-black" />
        </div>
        <div className="mt-6 flex justify-around w-full text-sm">
          <div className="p-3 bg-gray-800/80 rounded-lg">
            <p><b>Write Access:</b> Ownership of IP ✅</p>
          </div>
          <div className="p-3 bg-gray-800/80 rounded-lg">
            <p><b>Read Access:</b> Valid IP License ✅<br />Valid Remote Attestation ✅</p>
          </div>
        </div>
      </>
    );
  }, [type]);

  return (
    <section className="bg-black text-white flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-10 rounded-2xl border border-white/10">
      <h1 className="text-3xl font-bold text-center">IP Vault Flow</h1>

      <div className="flex space-x-4">
        <button onClick={() => setType("vault")} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400">IP Vault</button>
        <button onClick={() => setType("tee")} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400">IP Vault + TEE</button>
      </div>

      <div ref={flowRef} className="w-full max-w-5xl mt-2 flex flex-col items-center">
        {Flow}
      </div>
    </section>
  );
}
