import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Cpu,
  Lock,
  ShieldCheck,
  User2,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function StoryAnimation({ mode }: { mode: "vault" | "tee" }) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const ownerRef = useRef<HTMLDivElement | null>(null);
  const buyerRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
  const vaultRef = useRef<HTMLDivElement | null>(null);
  const doorRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const teeRef = useRef<HTMLDivElement | null>(null);
  const licBadgeRef = useRef<HTMLDivElement | null>(null);
  const attBadgeRef = useRef<HTMLDivElement | null>(null);
  const talkOwnerRef = useRef<HTMLDivElement | null>(null);
  const talkBuyerRef = useRef<HTMLDivElement | null>(null);

  // Stepper state for clearer understanding
  const [step, setStep] = useState(0);
  const stepsVault = [
    "Owner enkripsi & titip kunci",
    "Vault mengunci (simpan kunci, bukan file)",
    "Lisensi diverifikasi",
    "Akses/dekripsi diberikan",
  ];
  const stepsTEE = [
    "Owner enkripsi & titip kunci",
    "Attestation TEE diverifikasi",
    "Lisensi diverifikasi",
    "Akses/dekripsi di lingkungan aman",
  ];

  const positions = {
    owner: "12%",
    vault: "50%",
    tee: "70%",
    buyer: "88%",
  } as const;

  const reset = () => {
    gsap.set(ownerRef.current, {
      left: positions.owner,
      top: "62%",
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
    });
    gsap.set(docRef.current, {
      left: positions.owner,
      top: "44%",
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      scale: 1,
    });
    gsap.set(buyerRef.current, {
      left: positions.buyer,
      top: "62%",
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
    });
    gsap.set(licBadgeRef.current, { opacity: 0, y: 10 });
    gsap.set(attBadgeRef.current, { opacity: 0, y: 10 });
    gsap.set(doorRef.current, { width: "100%" });
    gsap.set(lockRef.current, { scale: 1, opacity: 1, color: "#0f172a" });
    gsap.set([talkOwnerRef.current, talkBuyerRef.current], { opacity: 0, y: 8 });
    setStep(0);
  };

  const playMain = () => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    // Step 1: Owner to Vault carrying doc
    tl.call(() => setStep(0))
      .to(ownerRef.current, { left: "45%", duration: 1.1 })
      .to(docRef.current, { left: "47%", duration: 1.1 }, "<")
      // Step 2: Doc inside vault, door closes, lock pulses
      .call(() => setStep(1))
      .to(docRef.current, {
        left: positions.vault,
        top: "52%",
        scale: 0.7,
        duration: 0.55,
      })
      .to(doorRef.current, { width: "0%", duration: 0.3 }, "openDoor")
      .to(docRef.current, { opacity: 0, duration: 0.3 }, "openDoor+=0.05")
      .to(doorRef.current, { width: "100%", duration: 0.3 })
      .to(lockRef.current, { scale: 1.15, duration: 0.22, yoyo: true, repeat: 1 }, "-=0.1");

    if (mode === "vault") {
      // Step 3: License verified
      tl.call(() => setStep(2))
        .to(buyerRef.current, { left: "56%", duration: 1.0, delay: 0.15 })
        .to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.3 })
        // Step 4: Door opens and doc goes to buyer
        .call(() => setStep(3))
        .to(doorRef.current, { width: "0%", duration: 0.3 })
        .to(docRef.current, { opacity: 1, scale: 0.7, left: positions.vault, top: "52%", duration: 0 })
        .to(docRef.current, { left: "56%", top: "62%", scale: 1, duration: 0.55 })
        .to(doorRef.current, { width: "100%", duration: 0.3 });
    } else {
      // Step 2 (TEE path): Attestation
      tl.call(() => setStep(1))
        .to(buyerRef.current, { left: positions.tee, duration: 0.95, delay: 0.15 })
        .to(attBadgeRef.current, { opacity: 1, y: 0, duration: 0.3 })
        // Step 3: License verified
        .call(() => setStep(2))
        .to(buyerRef.current, { left: "56%", duration: 0.85 })
        .to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.3 }, "+=0.05")
        // Step 4: Access granted in secure env
        .call(() => setStep(3))
        .to(doorRef.current, { width: "0%", duration: 0.3 })
        .to(docRef.current, { opacity: 1, scale: 0.7, left: positions.vault, top: "52%", duration: 0 })
        .to(docRef.current, { left: "56%", top: "62%", scale: 1, duration: 0.55 })
        .to(doorRef.current, { width: "100%", duration: 0.3 });
    }
    return tl;
  };

  const play = () => {
    reset();
    const master = gsap.timeline();
    master
      .to(talkOwnerRef.current, { opacity: 1, y: 0, duration: 0.35 })
      .to(talkOwnerRef.current, { opacity: 0, duration: 0.25 }, "+=1.0")
      .to(talkBuyerRef.current, { opacity: 1, y: 0, duration: 0.35 })
      .to(talkBuyerRef.current, { opacity: 0, duration: 0.25 }, "+=1.0")
      .add(playMain());
  };

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const currentSteps = mode === "tee" ? stepsTEE : stepsVault;

  return (
    <div className="w-full max-w-[80rem]">
      {/* Stepper */}
      <div className="mb-4 w-full max-w-4xl mx-auto">
        <ol className="grid grid-cols-1 gap-2 text-xs text-white/80 sm:grid-cols-4">
          {currentSteps.map((label, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className={
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] " +
                  (i === step ? "bg-white text-black border-white" : "border-white/40 text-white/80")
                }
              >
                {i + 1}
              </span>
              <span className={i === step ? "font-semibold" : "opacity-80"}>
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-4 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3">
          <div
            ref={talkOwnerRef}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90"
          >
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <MessageSquare className="size-3" /> IP Owner
            </div>
            <p className="text-sm">Aku ingin mengunggah dan mengunci dokumen IP-ku dengan aman.</p>
          </div>
          <div
            ref={talkBuyerRef}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90"
          >
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <MessageSquare className="size-3" /> IP Buyer
            </div>
            <p className="text-sm">Saya ingin melisensi dan mengaksesnya hanya jika syaratnya terpenuhi.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={play} className="rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Play
          </button>
          <span className="text-xs opacity-80">Walkthrough: {mode === "tee" ? "TEE attestation path" : "Standard license path"}</span>
        </div>
      </div>

      <div
        ref={sceneRef}
        className="relative h-96 md:h-[28rem] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
      >
        {/* Vault */}
        <div
          ref={vaultRef}
          className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-yellow-400 text-black shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="size-7" />
          </div>
          {/* Door overlay */}
          <div ref={doorRef} className="absolute left-0 top-0 h-full bg-yellow-500/60" />
          <div
            ref={lockRef}
            className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300/90 px-2.5 py-0.5 text-xs font-semibold text-black shadow"
          >
            Locked
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-black/80">
            Simpan kunci, bukan file
          </div>
        </div>

        {/* Safe room (TEE) */}
        <div
          className="absolute"
          style={{ left: positions.tee, top: "22%", transform: "translateX(-50%)" }}
        >
          <div className="rounded-xl border border-white/10 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 inline-flex items-center gap-1">
            <Cpu className="size-3" /> Safe Room
          </div>
        </div>

        {/* Owner */}
        <div ref={ownerRef} className="absolute">
          <div className="flex size-14 items-center justify-center rounded-full bg-blue-500">
            <User2 className="size-7" />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">IP Owner</div>
        </div>

        {/* Buyer */}
        <div ref={buyerRef} className="absolute">
          <div className="flex size-14 items-center justify-center rounded-full bg-white text-black">
            <User2 className="size-7" />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">Buyer</div>
        </div>

        {/* Document */}
        <div ref={docRef} className="absolute">
          <div className="flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow">
            <FileText className="size-4" />
            <span className="text-xs font-medium">IP Doc</span>
          </div>
        </div>

        {/* Badges */}
        <div ref={licBadgeRef} className="absolute left-1/2 top-[82%] -translate-x-1/2">
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-3" /> License OK
          </div>
        </div>
        <div
          ref={attBadgeRef}
          className="absolute"
          style={{ left: positions.tee, top: "42%", transform: "translateX(-50%)" }}
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-3" /> Attestation OK
          </div>
        </div>
      </div>
    </div>
  );
}
