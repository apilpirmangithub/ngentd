import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Cpu,
  ShieldCheck,
  User2,
  FileText,
  MessageSquare,
  Database,
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
  const ipfsBadgeRef = useRef<HTMLDivElement | null>(null);
  const masterRef = useRef<gsap.core.Timeline | null>(null);

  const positions = {
    owner: "12%",
    ipfs: "30%",
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
    gsap.set(ipfsBadgeRef.current, { opacity: 0, y: 10 });
    gsap.set(doorRef.current, { width: "100%" }); // door closed
    gsap.set(lockRef.current, { scale: 1, opacity: 1, color: "#0f172a" });
    gsap.set([talkOwnerRef.current, talkBuyerRef.current], {
      opacity: 0,
      y: 8,
    });
  };

  const playMain = () => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    // Owner walks to IPFS carrying doc
    tl.to(ownerRef.current, { left: "30%", duration: 1.0 })
      .to(docRef.current, { left: "32%", duration: 1.0 }, "<")
      // Document stored on IPFS (disappear into storage)
      .to(docRef.current, {
        left: positions.ipfs,
        top: "52%",
        scale: 0.85,
        duration: 0.5,
      })
      .to(ipfsBadgeRef.current, { opacity: 1, y: 0, duration: 0.3 }, "-=0.1")
      .to(docRef.current, { opacity: 0, duration: 0.25 })
      // Key saved in Vault (lock pulse)
      .to(
        lockRef.current,
        { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1 },
        "+=0.1",
      );

    if (mode === "vault") {
      // Buyer approaches vault, license check, door opens, doc fetched from IPFS and delivered
      tl.to(buyerRef.current, { left: "56%", duration: 1.1, delay: 0.2 })
        .to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.35 })
        .to(doorRef.current, { width: "0%", duration: 0.35 })
        // doc appears from IPFS side and moves to buyer via vault gate
        .to(docRef.current, {
          opacity: 1,
          scale: 0.85,
          left: positions.ipfs,
          top: "52%",
          duration: 0,
        })
        .to(docRef.current, {
          left: "56%",
          top: "62%",
          scale: 1,
          duration: 0.7,
        })
        .to(doorRef.current, { width: "100%", duration: 0.35 });
    } else {
      // TEE path: buyer goes to safe room first, then license, then fetch through vault
      tl.to(buyerRef.current, {
        left: positions.tee,
        duration: 1.0,
        delay: 0.2,
      })
        .to(attBadgeRef.current, { opacity: 1, y: 0, duration: 0.35 })
        .to(buyerRef.current, { left: "56%", duration: 0.9 })
        .to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.35 }, "+=0.1")
        .to(doorRef.current, { width: "0%", duration: 0.35 })
        .to(docRef.current, {
          opacity: 1,
          scale: 0.85,
          left: positions.ipfs,
          top: "52%",
          duration: 0,
        })
        .to(docRef.current, {
          left: "56%",
          top: "62%",
          scale: 1,
          duration: 0.7,
        })
        .to(doorRef.current, { width: "100%", duration: 0.35 });
    }
    return tl;
  };

  const play = () => {
    reset();
    const master = gsap.timeline();
    master
      .to(talkOwnerRef.current, { opacity: 1, y: 0, duration: 0.4 })
      .to(talkOwnerRef.current, { opacity: 0, duration: 0.3 }, "+=1.1")
      .to(talkBuyerRef.current, { opacity: 1, y: 0, duration: 0.4 })
      .to(talkBuyerRef.current, { opacity: 0, duration: 0.3 }, "+=1.1")
      .add(playMain());
    return master;
  };

  useEffect(() => {
    masterRef.current?.kill();
    masterRef.current = play();
    return () => {
      masterRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Visual events from parent (e.g. upload -> animate file to IPFS and key to vault)
  useEffect(() => {
    // event prop handled in parent via re-render
  }, []);

  return (
    <div className="w-full max-w-[80rem]">
      <div className="mb-4 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3">
          <div
            ref={talkOwnerRef}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transform-gpu"
          >
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <MessageSquare className="size-3" /> IP Owner
            </div>
            <p className="text-sm">
              Aku ingin mengunggah dan mengunci dokumen IP-ku dengan aman.
            </p>
          </div>
          <div
            ref={talkBuyerRef}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transform-gpu"
          >
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <MessageSquare className="size-3" /> IP Buyer
            </div>
            <p className="text-sm">
              Saya ingin melisensi dan mengaksesnya hanya jika syaratnya
              terpenuhi.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            masterRef.current?.kill();
            masterRef.current = play();
          }}
          className="rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15"
        >
          Play
        </button>
        <span>
          Walkthrough:{" "}
          {mode === "tee" ? "TEE attestation path" : "Standard license path"}
        </span>
      </div>
      <div
        ref={sceneRef}
        className="relative h-96 md:h-[28rem] w-full overflow-hidden rounded-2xl border border-white/10 bg-black transform-gpu"
      >
        {/* IPFS node */}
        <div
          className="absolute transform-gpu"
          style={{
            left: positions.ipfs,
            top: "22%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-md border border-sky-200/20 bg-sky-500/20 px-3 py-1 text-xs text-sky-200">
            <Database className="size-3" /> IPFS Storage
          </div>
        </div>

        {/* Vault */}
        <div
          ref={vaultRef}
          className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-yellow-400 text-black shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F45b51cbd16f1407caa5463a5ffd74106%2F1fb9fcb5c7b44919b4aa9abd73481a1f?format=webp&width=800"
              alt="Vault"
              className="h-8 w-8 object-contain"
            />
          </div>
          {/* Door overlay */}
          <div
            ref={doorRef}
            className="absolute left-0 top-0 h-full bg-yellow-500/60"
          />
          <div
            ref={lockRef}
            className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300/90 px-2.5 py-0.5 text-xs font-semibold text-black shadow"
          >
            Key in Vault
          </div>
        </div>

        {/* Safe room (TEE) */}
        <div
          className="absolute transform-gpu"
          style={{
            left: positions.tee,
            top: "22%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="rounded-xl border border-white/10 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 inline-flex items-center gap-1">
            <Cpu className="size-3" /> Safe Room
          </div>
        </div>

        {/* Owner */}
        <div ref={ownerRef} className="absolute transform-gpu">
          <div className="flex size-14 items-center justify-center rounded-full bg-blue-500">
            <User2 className="size-7" />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">IP Owner</div>
        </div>

        {/* Buyer */}
        <div ref={buyerRef} className="absolute transform-gpu">
          <div className="flex size-14 items-center justify-center rounded-full bg-white text-black">
            <User2 className="size-7" />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">Buyer</div>
        </div>

        {/* Document */}
        <div ref={docRef} className="absolute transform-gpu">
          <div className="flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow">
            <FileText className="size-4" />
            <span className="text-xs font-medium">IP Doc</span>
          </div>
        </div>

        {/* Badges */}
        <div
          ref={licBadgeRef}
          className="absolute left-1/2 top-[82%] -translate-x-1/2 transform-gpu"
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-3" /> License OK
          </div>
        </div>
        <div
          ref={attBadgeRef}
          className="absolute transform-gpu"
          style={{
            left: positions.tee,
            top: "42%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-3" /> Attestation OK
          </div>
        </div>
        <div
          ref={ipfsBadgeRef}
          className="absolute transform-gpu"
          style={{
            left: positions.ipfs,
            top: "42%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 px-2 py-1 text-sky-200 text-xs">
            <ShieldCheck className="size-3" /> Stored on IPFS
          </div>
        </div>
      </div>
    </div>
  );
}
