import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import {
  Cpu,
  ShieldCheck,
  User2,
  FileText,
  MessageSquare,
  Database,
  Clock,
  Scissors,
  EyeOff,
  Monitor,
  Lock,
  Unlock,
} from "lucide-react";

export default function StoryAnimation({
  mode,
  event,
}: {
  mode: "vault" | "tee";
  event?: string | null;
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const ownerRef = useRef<HTMLDivElement | null>(null);
  const buyerRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
  const vaultRef = useRef<HTMLDivElement | null>(null);
  const doorRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const teeRef = useRef<HTMLDivElement | null>(null);
  const mpcRef = useRef<HTMLDivElement | null>(null);
  const licBadgeRef = useRef<HTMLDivElement | null>(null);
  const attBadgeRef = useRef<HTMLDivElement | null>(null);
  const ipfsBadgeRef = useRef<HTMLDivElement | null>(null);
  const condRef = useRef<HTMLDivElement | null>(null);
  const writeCondRef = useRef<HTMLDivElement | null>(null);
  const readCondRef = useRef<HTMLDivElement | null>(null);
  const ownerCheckRef = useRef<HTMLDivElement | null>(null);
  const masterRef = useRef<gsap.core.Timeline | null>(null);

  // idle animation refs
  const ownerIdle = useRef<gsap.core.Tween | null>(null);
  const buyerIdle = useRef<gsap.core.Tween | null>(null);

  // story label ref (to move above vault when it appears)
  const storyRef = useRef<HTMLDivElement | null>(null);

  const positions = {
    owner: "12%",
    ipfs: "30%",
    vault: "50%",
    tee: "70%",
    buyer: "88%",
  } as const;

  // configurable delays
  const buyerMoveDelay = 0.6; // seconds delay before buyer starts moving
  const unlockDelay = 0.15; // base unlock delay used for TEE flow
  const postLockBuyerDelay = 0.25; // small delay between lock engage and buyer sequence
  // delay to unlock AFTER License OK is shown for non-TEE flow (tuned for good pacing)
  const unlockAfterLicenseDelay = 0.6;

  // simple audio manager using WebAudio (no external assets)
  const audioRef = useRef<any>(null);

  class AudioManager {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    constructor() {
      try {
        this.ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.12;
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        this.ctx = null;
      }
    }

    playTone = (freq: number, type = "sine", duration = 0.12, decay = 0.02) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type as OscillatorType;
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(this.masterGain!);
      const now = this.ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(1, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration + decay);
      o.start(now);
      o.stop(now + duration + decay + 0.02);
    };

    playClick = () => this.playTone(880, "sine", 0.06);
    playRelease = () => {
      this.playTone(520, "triangle", 0.08);
      this.playTone(760, "sine", 0.07);
    };
    // deeper, shorter lock click
    playLock = () => {
      this.playTone(220, "square", 0.12);
      this.playTone(380, "sine", 0.08);
    };
    // bright unlock
    playUnlock = () => {
      this.playTone(1100, "sine", 0.09);
    };
    // success: bright short chord
    playSuccess = () => {
      this.playTone(1100, "sine", 0.08);
      this.playTone(780, "sine", 0.09);
    };
    // deliver: swoosh-ish by quick descending tones
    playDeliver = () => {
      this.playTone(680, "sine", 0.12);
      this.playTone(520, "triangle", 0.14);
    };
    playVaultReveal = () => {
      this.playTone(420, "sine", 0.18);
    };
  }

  const reset = () => {
    // stop any existing idle animations
    try {
      ownerIdle.current?.kill();
      buyerIdle.current?.kill();
    } catch (e) {
      /* ignore */
    }

    gsap.set(ownerRef.current, {
      left: positions.owner,
      top: "62%",
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      scale: 1,
      transform: "translate3d(-50%, -50%, 0)",
    });
    // reset story label position
    if (storyRef.current) {
      try {
        gsap.set(storyRef.current, { y: 0, opacity: 1 });
      } catch (e) {
        /* ignore */
      }
    }
    gsap.set(docRef.current, {
      left: positions.owner,
      top: "44%",
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      pointerEvents: "none",
      scale: 1,
      transform: "translate3d(-50%, -50%, 0)",
    });
    gsap.set(buyerRef.current, {
      left: positions.buyer,
      top: "62%",
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      scale: 1,
      transform: "translate3d(-50%, -50%, 0)",
    });
    gsap.set(licBadgeRef.current, { opacity: 0, y: 10 });
    if (attBadgeRef.current)
      gsap.set(attBadgeRef.current, { opacity: 0, y: 10 });
    gsap.set(ipfsBadgeRef.current, { opacity: 0, y: 10 });
    if (ownerCheckRef.current)
      gsap.set(ownerCheckRef.current, { opacity: 0, y: 10 });
    // hide TEE badge initially; reveal when buyer reaches vault
    if (teeRef.current) gsap.set(teeRef.current, { opacity: 0, y: 8 });
    try {
      const scene = sceneRef.current;
      const topBadge = scene?.querySelector(".ipfs-text")
        ?.parentElement as HTMLElement | null;
      if (topBadge) {
        gsap.set(topBadge, { opacity: 1, y: 0 });
      }
    } catch (e) {
      // ignore
    }
    gsap.set(doorRef.current, { width: "100%" }); // door closed
    gsap.set(lockRef.current, {
      scale: 1,
      opacity: 0,
      color: "#ffffff",
      backgroundColor: "#10B981",
      transform: "translate3d(-50%, -50%, 0)",
    });
    // hide vault until lock reaches it
    if (vaultRef.current) {
      try {
        gsap.set(vaultRef.current, { opacity: 0, scale: 0.98, y: 6 });
      } catch (e) {
        /* ignore */
      }
    }
    if (lockRef.current) {
      const unlockEl = lockRef.current.querySelector(
        ".unlock-icon",
      ) as HTMLElement | null;
      const lockElInner = lockRef.current.querySelector(
        ".lock-icon",
      ) as HTMLElement | null;
      unlockEl?.classList.remove("opacity-0");
      lockElInner?.classList.add("opacity-0");
    }
    if (condRef.current) gsap.set(condRef.current, { opacity: 0, y: 10 });
  };

  const playMain = () => {
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    const targetLeft = positions.tee;
    // Owner walks to IPFS carrying doc
    tl.to(ownerRef.current, { left: "30%", duration: 1.2 })
      .to(
        docRef.current,
        { left: "30%", xPercent: -50, yPercent: -50, duration: 1.2 },
        "<",
      )
      // Document stored on IPFS (fade into storage)
      .to(ipfsBadgeRef.current, { opacity: 1, y: 0, duration: 0.36 })
      .to(docRef.current, { opacity: 0, duration: 0.28 })
      // trigger upload split animation (file -> ipfs -> lock slides to vault)
      .call(performUploadSplit)
      // Key saved in Vault (lock pulse)
      .set(lockRef.current, { scale: 1 }, "+=0.1")
      // Set lock to locked visual state (green background, white icon)
      .to(
        lockRef.current,
        { backgroundColor: "#9CA3AF", color: "#000000", duration: 0.22 },
        ">",
      )
      .to(writeCondRef.current, { opacity: 1, y: 0, duration: 0.36 }, ">-");

    // buyer movement is triggered after lock is engaged via startBuyerSequence();
    // no buyer movement added here to ensure lock completes before buyer moves.
    return tl;
  };

  const build = () => {
    reset();
    const master = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.inOut" },
    });
    master.add(playMain());
    return master;
  };

  useLayoutEffect(() => {
    masterRef.current?.kill();
    masterRef.current = build();

    // start smooth idle animations for owner and buyer
    const startIdleAnimations = () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }

        // prepare elements for GPU-accelerated transforms
        try {
          const els: (HTMLElement | null)[] = [
            ownerRef.current,
            buyerRef.current,
            vaultRef.current,
            ipfsBadgeRef.current,
            docRef.current,
            lockRef.current,
            teeRef.current,
            storyRef.current,
          ];
          els.forEach((el) => {
            if (el) {
              el.style.willChange = "transform, opacity";
              // ensure using translate3d for smoother GPU compositing
              if (!/translate3d/.test(el.style.transform || "")) {
                el.style.transform = (el.style.transform || "")
                  .replace(/translate\(/g, "translate3d(")
                  .replace(/translateX\(/g, "translate3d(")
                  .replace(/translateY\(/g, "translate3d(");
              }
              gsap.set(el, { transformOrigin: "50% 50%" });
            }
          });
        } catch (e) {
          /* ignore */
        }

        // gentle bob + micro-rotation for a smooth, organic movement
        if (ownerRef.current) {
          ownerIdle.current = gsap.to(ownerRef.current, {
            y: -8,
            rotation: 0.6,
            duration: 3.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        }

        if (buyerRef.current) {
          buyerIdle.current = gsap.to(buyerRef.current, {
            y: -6,
            rotation: -0.6,
            duration: 3.0,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 0.5,
          });
        }
      } catch (e) {
        /* ignore */
      }
    };

    startIdleAnimations();

    // initialize audio manager (will silently fail if AudioContext not available)
    try {
      audioRef.current = new AudioManager();
    } catch (e) {
      audioRef.current = null;
    }

    return () => {
      masterRef.current?.kill();
      try {
        ownerIdle.current?.kill();
        buyerIdle.current?.kill();
      } catch (e) {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // helper to set lock element to unlocked visual state
  const setLockToUnlock = () => {
    const lockEl = lockRef.current;
    if (!lockEl) return;
    const unlockIcon = lockEl.querySelector(
      ".unlock-icon",
    ) as HTMLElement | null;
    const lockIcon = lockEl.querySelector(".lock-icon") as HTMLElement | null;

    // show unlock icon, hide locked icon
    unlockIcon?.classList.remove("opacity-0");
    lockIcon?.classList.add("opacity-0");

    try {
      lockEl.classList.remove("bg-gray-400", "text-black");
      lockEl.classList.add("bg-emerald-600", "text-white");
    } catch (e) {
      /* ignore */
    }

    try {
      lockEl.style.backgroundColor = "#10B981";
      lockEl.style.color = "#ffffff";
      // ensure no transform for instant state
      lockEl.style.transform = "";
      // sound: unlock
      audioRef.current?.playUnlock();
    } catch (e) {
      /* ignore */
    }
  };

  // start buyer sequence after lock is engaged
  function startBuyerSequence() {
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    if (mode === "vault") {
      tl.to(buyerRef.current, {
        left: positions.tee,
        duration: 1.12,
        delay: buyerMoveDelay,
      })
        .call(performTrailToBuyer)
        .call(performBuyerScan)
        .to({}, { duration: 0.72 })
        // position License OK above the buyer when buyer has moved to the vault
        .call(() => {
          try {
            const scene = sceneRef.current;
            const buyerEl = buyerRef.current;
            const licEl = licBadgeRef.current;
            if (scene && buyerEl && licEl) {
              const sceneRect = scene.getBoundingClientRect();
              const buyerRect = buyerEl.getBoundingClientRect();
              const left =
                buyerRect.left - sceneRect.left + buyerRect.width / 2;
              // place slightly above buyer (use buyer height + offset)
              const top =
                buyerRect.top -
                sceneRect.top -
                Math.round(buyerRect.height * 0.6);
              // apply absolute pixel positioning and a translate to center above
              Object.assign(licEl.style, {
                left: `${left}px`,
                top: `${top}px`,
                transform: "translate(-50%,-50%)",
                position: "absolute",
              });
              gsap.set(licEl, { opacity: 0, y: 6 });
              gsap.to(licEl, {
                opacity: 1,
                y: 0,
                duration: 0.36,
                ease: "power3.out",
              });
            } else {
              // fallback to simple reveal
              gsap.to(licBadgeRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.36,
              });
            }
          } catch (e) {
            gsap.to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.36 });
          }
        })
        // perform attestation check visual after showing License OK
        .call(() => performAttestationReveal())
        .call(() => audioRef.current?.playSuccess())
        .call(() => gsap.delayedCall(unlockAfterLicenseDelay, setLockToUnlock))
        .to(readCondRef.current, { opacity: 1, y: 0, duration: 0.36 })
        .to({}, { duration: 0.6 })
        .to(doorRef.current, { width: "0%", duration: 0.36 })
        .call(performDeliver)
        .to(doorRef.current, { width: "100%", duration: 0.36 });
    } else {
      tl.to(buyerRef.current, {
        left: positions.tee,
        duration: 1.02,
        delay: buyerMoveDelay,
      })
        // reveal TEE badge when buyer reaches the vault (visual)
        .call(() => {
          if (teeRef.current)
            gsap.to(teeRef.current, { opacity: 1, y: 0, duration: 0.28 });
        })
        .call(performTrailToBuyer)
        .to({}, { duration: 0.6 })
        .to(buyerRef.current, { left: positions.tee, duration: 0.22 })
        .call(performBuyerScan)
        .to({}, { duration: 0.72 })
        .to(licBadgeRef.current, { opacity: 1, y: 0, duration: 0.36 }, "+=0.1")
        .call(performAttestationReveal)
        .call(() => audioRef.current?.playSuccess())
        .to(readCondRef.current, { opacity: 1, y: 0, duration: 0.36 })
        .to(condRef.current, { opacity: 1, y: 0, duration: 0.36 })
        .from(
          condRef.current?.querySelectorAll("[data-rule]"),
          { opacity: 0, y: 6, stagger: 0.08, duration: 0.28 },
          "<",
        )
        .call(() => gsap.delayedCall(unlockDelay, setLockToUnlock))
        .to({}, { duration: 0.6 })
        .to(doorRef.current, { width: "0%", duration: 0.36 })
        .call(performDeliver)
        .to(doorRef.current, { width: "100%", duration: 0.36 });
    }
    return tl;
  }

  // helper functions for demo visual sequence
  const performUploadSplit = () => {
    const scene = sceneRef.current;
    const doc = docRef.current;
    const ipfsBadge = ipfsBadgeRef.current;
    const vault = vaultRef.current;

    if (scene && ownerRef.current && doc) {
      // hide the owner's static IP File during animated upload
      try {
        gsap.set(doc, { opacity: 0, pointerEvents: "none" });
      } catch (e) {
        /* ignore */
      }
      const sceneRect = scene.getBoundingClientRect();
      const ownerRect = ownerRef.current.getBoundingClientRect();
      const ipfsRect = ipfsBadge?.getBoundingClientRect();
      const vaultRect = vault?.getBoundingClientRect();

      // Upload progress indicator under IP Owner
      let uploadEl: HTMLDivElement | null = null;
      let uploadBar: HTMLDivElement | null = null;
      if (ipfsRect) {
        try {
          const ownerCenterX = ownerRect.left - sceneRect.left + ownerRect.width / 2;
          const ownerBottomY = ownerRect.bottom - sceneRect.top + 12;

          uploadEl = document.createElement("div");
          uploadEl.className = "pointer-events-none";
          Object.assign(uploadEl.style, {
            position: "absolute",
            left: `${ownerCenterX}px`,
            top: `${ownerBottomY}px`,
            width: `136px`,
            transform: "translate3d(-50%,0,0)",
            zIndex: "9998",
            opacity: "0",
          });

          const box = document.createElement("div");
          Object.assign(box.style, {
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            padding: "6px 8px",
            backdropFilter: "blur(2px)",
          });
          uploadEl.appendChild(box);

          const label = document.createElement("div");
          label.textContent = "Mengunggah…";
          Object.assign(label.style, {
            fontSize: "10px",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "4px",
            textAlign: "center",
          });
          box.appendChild(label);

          const track = document.createElement("div");
          Object.assign(track.style, {
            width: "100%",
            height: "4px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "9999px",
            overflow: "hidden",
          });
          box.appendChild(track);

          uploadBar = document.createElement("div");
          Object.assign(uploadBar.style, {
            width: "0%",
            height: "100%",
            background: "linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,1))",
            borderRadius: "9999px",
          });
          track.appendChild(uploadBar);

          scene.appendChild(uploadEl);
          gsap.to(uploadEl, { opacity: 1, duration: 0.15, ease: "power1.out" });
          // advance progress while file moves to IPFS
          gsap.to(uploadBar, { width: "80%", duration: 1.15, ease: "linear" });
        } catch (e) {
          /* ignore */
        }
      }
      // Prefer the top IPFS text element if present
      const ipfsTextEl = scene.querySelector(
        ".ipfs-text",
      ) as HTMLElement | null;
      const ipfsTextRect = ipfsTextEl?.getBoundingClientRect();

      const fileEl = document.createElement("div");
      fileEl.className =
        "pointer-events-none rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow transform-gpu";
      fileEl.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"inline-block align-middle mr-1\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline></svg><span class=\"text-xs font-medium\">IP File</span>`;
      Object.assign(fileEl.style, { position: "absolute", zIndex: "9999" });
      scene.appendChild(fileEl);

      const startX = ownerRect.left - sceneRect.left + ownerRect.width / 2;
      const startY = ownerRect.top - sceneRect.top + ownerRect.height / 2;

      Object.assign(fileEl.style, {
        left: `${startX}px`,
        top: `${startY}px`,
        transform: "translate3d(-50%,-50%,0)",
      });

      // Pulse the owner element to indicate releasing the IP File
      try {
        const ownerEl = ownerRef.current;
        if (ownerEl) {
          gsap.fromTo(
            ownerEl,
            { scale: 1 },
            {
              scale: 1.06,
              yoyo: true,
              repeat: 1,
              duration: 0.2,
              ease: "power3.out",
            },
          );
        }
        // sound: release
        audioRef.current?.playRelease();
      } catch (e) {
        /* ignore */
      }

      if (ipfsRect) {
        const endX = ipfsTextRect
          ? ipfsTextRect.left - sceneRect.left + ipfsTextRect.width / 2
          : ipfsRect.left - sceneRect.left + ipfsRect.width / 2;
        const endY = ipfsTextRect
          ? ipfsTextRect.top - sceneRect.top + ipfsTextRect.height / 2
          : ipfsRect.top - sceneRect.top + ipfsRect.height / 2;
        gsap.to(fileEl, {
          left: `${endX}px`,
          top: `${endY}px`,
          scale: 1,
          duration: 1.15,
          ease: "power3.inOut",
          onComplete: () => {
            // complete and remove upload indicator
            try {
              if (uploadBar) gsap.to(uploadBar, { width: "100%", duration: 0.3, ease: "linear" });
              if (uploadEl)
                gsap.to(uploadEl, {
                  opacity: 0,
                  duration: 0.2,
                  delay: 0.15,
                  onComplete: () => uploadEl && uploadEl.remove(),
                });
            } catch (e) {
              /* ignore */
            }
            // Morph the floating file into the IPFS badge
            try {
              // keep floating file appearance (do not change to 'IPFS')
              fileEl.className =
                "pointer-events-none rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow transform-gpu";

              // small pulse to emphasize morph
              gsap.fromTo(
                fileEl,
                { scale: 0.94, opacity: 1 },
                { scale: 1, duration: 0.2, ease: "power1.out" },
              );

              // update the top IPFS badge to show 'IPFS' and reveal it
              try {
                const topBadge = scene.querySelector(".ipfs-text")
                  ?.parentElement as HTMLElement | null;
                if (topBadge) {
                  topBadge.innerHTML = `\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"inline-block align-middle mr-1\"><path d=\"M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7\"></path><path d=\"M7 17a4 4 0 0 0 8 0\"></path></svg>\n                    <span class=\"text-xs font-medium\">IPFS</span>\n                  `;
                  gsap.set(topBadge, { opacity: 0, y: 8 });
                  gsap.to(topBadge, {
                    opacity: 1,
                    y: 0,
                    duration: 0.28,
                    delay: 0.18,
                    ease: "power3.out",
                  });
                } else {
                  gsap.to(ipfsBadge, {
                    opacity: 1,
                    y: 0,
                    duration: 0.28,
                    delay: 0.18,
                    ease: "power3.out",
                  });
                }
              } catch (e) {
                gsap.to(ipfsBadge, {
                  opacity: 1,
                  y: 0,
                  duration: 0.28,
                  delay: 0.18,
                  ease: "power3.out",
                });
              }

              // ensure top badge DOM uses the same innerHTML as the ipfsBadgeRef (preserve Database icon)
              try {
                const top = scene.querySelector(".ipfs-text")
                  ?.parentElement as HTMLElement | null;
                if (top && ipfsBadgeRef.current) {
                  top.innerHTML = ipfsBadgeRef.current.innerHTML;
                }
              } catch (e) {
                /* ignore */
              }

              // run lock animation as before
              const lockEl = lockRef.current;
              if (lockEl) {
                const unlockIcon = lockEl.querySelector(
                  ".unlock-icon",
                ) as HTMLElement | null;
                const lockIcon = lockEl.querySelector(
                  ".lock-icon",
                ) as HTMLElement | null;
                // show unlock icon and ensure unlock styling (green bg)
                unlockIcon?.classList.remove("opacity-0");
                lockIcon?.classList.add("opacity-0");
                try {
                  lockEl.classList.remove("bg-gray-400", "text-black");
                  lockEl.classList.add("bg-emerald-600", "text-white");
                } catch (e) {
                  /* ignore */
                }
                try {
                  lockEl.style.backgroundColor = "#10B981";
                  lockEl.style.color = "#ffffff";
                } catch (e) {
                  /* ignore */
                }

                gsap.set(lockEl, {
                  left: `${endX}px`,
                  top: `${endY}px`,
                  xPercent: -50,
                  yPercent: -50,
                  opacity: 1,
                  scale: 0.92,
                  transform: "translate3d(-50%, -50%, 0)",
                });

                if (vaultRect) {
                  const vaultCenterX =
                    vaultRect.left - sceneRect.left + vaultRect.width / 2;
                  const vaultCenterY =
                    vaultRect.top - sceneRect.top + vaultRect.height / 2;

                  // nudge the lock down slightly so it sits visually below the vault center
                  const finalVaultY =
                    vaultCenterY + Math.round(vaultRect.height * 0.28);

                  gsap.to(lockEl, {
                    left: `${vaultCenterX}px`,
                    top: `${finalVaultY}px`,
                    duration: 1.0,
                    ease: "power3.inOut",
                    onComplete: () => {
                      if (unlockIcon) unlockIcon.classList.add("opacity-0");
                      if (lockIcon) lockIcon.classList.remove("opacity-0");

                      // Ensure any interfering Tailwind classes are removed so inline styles take effect
                      try {
                        lockEl.classList.remove("bg-white/90", "text-black");
                        lockEl.classList.add("bg-gray-400", "text-black");
                      } catch (e) {
                        /* ignore */
                      }

                      // Set final styles directly (more robust than animation for final state)
                      try {
                        lockEl.style.backgroundColor = "#9CA3AF";
                        lockEl.style.color = "#000000";
                        lockEl.style.opacity = "1";
                        // ensure the final top is applied (in case GSAP inline styles overridden)
                        lockEl.style.top = `${finalVaultY}px`;
                        // ensure no transform so final state is applied instantly
                        lockEl.style.transform = "";
                      } catch (e) {
                        /* ignore */
                      }

                      // locked state applied instantly (no pulse)

                      // sound: lock engaged
                      try {
                        audioRef.current?.playLock();
                      } catch (e) {
                        /* ignore */
                      }

                      // reveal the vault now that it's locked
                      try {
                        if (vaultRef.current) {
                          gsap.to(vaultRef.current, {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            duration: 0.36,
                            ease: "power3.out",
                          });
                          // small vault reveal sound
                          audioRef.current?.playVaultReveal();
                        }
                        // move story label above vault
                        try {
                          if (vaultRef.current && storyRef.current) {
                            const vaultRect2 =
                              vaultRef.current.getBoundingClientRect();
                            const moveUp = Math.round(
                              vaultRect2.height / 2 + 28,
                            );
                            gsap.to(storyRef.current, {
                              y: -moveUp,
                              duration: 0.36,
                              ease: "power3.out",
                            });
                          }
                        } catch (e) {
                          /* ignore */
                        }
                        // create light trail from owner to vault
                        performOwnerToVaultTrail();
                      } catch (e) {
                        /* ignore */
                      }
                    },
                  });
                }
              }

              // cleanup: remove the floating element after badge visible
              gsap.to(fileEl, {
                opacity: 0,
                duration: 0.28,
                delay: 0.5,
                onComplete: () => {
                  fileEl.remove();
                  try {
                    if (docRef.current) {
                      gsap.set(docRef.current, {
                        left: positions.owner,
                        top: "44%",
                        xPercent: -50,
                        yPercent: -50,
                        opacity: 0,
                        pointerEvents: "none",
                      });
                    }
                  } catch (e) {
                    // ignore
                  }
                },
              });
            } catch (e) {
              // fallback: simply show ipfs badge and remove fileEl
              gsap.to(ipfsBadge, { opacity: 1, y: 0, duration: 0.28 });
              gsap.to(fileEl, {
                opacity: 0,
                duration: 0.25,
                delay: 0.1,
                onComplete: () => fileEl.remove(),
              });
            }
          },
        });
      }

      // vault locking handled by lock animation from IPFS; no key element needed

      gsap.to(doc, { opacity: 0, duration: 0.2, delay: 0.15 });
    }
  };

  const performTrailToBuyer = () => {
    // Removed light dot/trail to IP Buyer per request
    return;
  };

  const performAttestationReveal = () => {
    const scene = sceneRef.current;
    const teeEl = teeRef.current;
    const mpcEl = mpcRef.current;
    const attEl = attBadgeRef.current;
    if (!scene || !attEl) return;

    try {
      const sceneRect = scene.getBoundingClientRect();
      const attRect = attEl.getBoundingClientRect();
      const targets: HTMLElement[] = [];
      if (teeEl) targets.push(teeEl);
      if (mpcEl) targets.push(mpcEl);

      const temps: HTMLElement[] = [];
      targets.forEach((t) => {
        const r = t.getBoundingClientRect();
        const temp = document.createElement("div");
        temp.className =
          "pointer-events-none rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs inline-flex items-center justify-center shadow";
        temp.style.position = "absolute";
        temp.style.zIndex = "9999";
        temp.innerHTML = '<span class="text-xs">✓</span>';
        scene.appendChild(temp);
        const startX = r.left - sceneRect.left + r.width / 2;
        const startY = r.top - sceneRect.top + r.height / 2;
        Object.assign(temp.style, {
          left: `${startX}px`,
          top: `${startY}px`,
          transform: "translate3d(-50%,-50%,0)",
        });
        temps.push(temp);
      });

      // animate temps to att badge center
      if (temps.length === 0) {
        // no source elements (TEE/MPC) to animate from — reveal attestation directly
        gsap.to(attEl, {
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: "power3.out",
        });
      } else {
        temps.forEach((temp, i) => {
          gsap.to(temp, {
            left: `${attRect.left - sceneRect.left + attRect.width / 2}px`,
            top: `${attRect.top - sceneRect.top + attRect.height / 2}px`,
            duration: 0.72,
            ease: "power3.inOut",
            delay: i * 0.08,
            onComplete: () => {
              gsap.to(attEl, {
                opacity: 1,
                y: 0,
                duration: 0.32,
                ease: "power3.out",
              });
              temp.remove();
            },
          });
        });
      }
    } catch (e) {
      // fallback: just reveal
      gsap.to(attEl, { opacity: 1, y: 0, duration: 0.35 });
    }
  };

  const performOwnerToVaultTrail = () => {
    // Remove light dot/trail; directly confirm ownership and continue sequence
    try {
      gsap.set(ownerCheckRef.current, { opacity: 1, y: 0 });
      audioRef.current?.playSuccess();
    } catch (e) {
      /* ignore */
    }
    try {
      gsap.delayedCall(postLockBuyerDelay, startBuyerSequence);
    } catch (e) {
      /* ignore */
    }
  };

  const performBuyerScan = () => {
    const scene = sceneRef.current;
    const buyerEl = buyerRef.current;
    if (!scene || !buyerEl) return;
    try {
      const sceneRect = scene.getBoundingClientRect();
      const bRect = buyerEl.getBoundingClientRect();
      const left = bRect.left - sceneRect.left + bRect.width / 2;
      const top = bRect.top - sceneRect.top + bRect.height / 2;
      const pad = 16;
      const w = Math.max(24, Math.round(bRect.width + pad));
      const h = Math.max(24, Math.round(bRect.height + pad));

      const container = document.createElement("div");
      container.className = "pointer-events-none";
      Object.assign(container.style, {
        position: "absolute",
        left: left + "px",
        top: top + "px",
        width: w + "px",
        height: h + "px",
        transform: "translate3d(-50%,-50%,0)",
        border: "2px solid rgba(255,255,255,0.28)",
        borderRadius: "14px",
        overflow: "hidden",
        zIndex: "9998",
        opacity: "0",
      });
      scene.appendChild(container);

      const line = document.createElement("div");
      Object.assign(line.style, {
        position: "absolute",
        left: "0",
        top: "-100%",
        width: "100%",
        height: "35%",
        background:
          "linear-gradient(to bottom, rgba(34,197,94,0) 0%, rgba(34,197,94,0.35) 50%, rgba(34,197,94,0) 100%)",
      });
      container.appendChild(line);

      gsap.to(container, { opacity: 1, duration: 0.12, ease: "power1.out" });
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tl.to(line, { top: "0%", duration: 0.35 })
        .to(line, { top: "100%", duration: 0.35 })
        .to(container, {
          opacity: 0,
          duration: 0.12,
          onComplete: () => container.remove(),
        }, "-=0.05");
    } catch (e) {
      /* ignore */
    }
  };

  const performDeliver = () => {
    const scene = sceneRef.current;
    const ipfsEl = ipfsBadgeRef.current;
    const buyerEl = buyerRef.current;
    if (scene && ipfsEl && buyerEl) {
      // Ensure IPFS badge is visible and layout is settled
      gsap.set(ipfsEl, { opacity: 1, y: 0 });
      // force reflow so measurements are accurate
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ipfsEl.offsetWidth;

      const sceneRect = scene.getBoundingClientRect();
      const ipfsRect = ipfsEl.getBoundingClientRect();
      const buyerRect = buyerEl.getBoundingClientRect();

      const docEl = document.createElement("div");
      docEl.className =
        "pointer-events-none rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow transform-gpu";
      docEl.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"inline-block align-middle mr-1\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline></svg><span class=\"text-xs font-medium\">IP File</span>`;
      Object.assign(docEl.style, {
        position: "absolute",
        zIndex: "9999",
        opacity: "1",
      });
      scene.appendChild(docEl);

      // Calculate exact centers (accounting for transforms)
      const startX = ipfsRect.left - sceneRect.left + ipfsRect.width / 2;
      const startY = ipfsRect.top - sceneRect.top + ipfsRect.height / 2;
      const endX = buyerRect.left - sceneRect.left + buyerRect.width / 2;
      const endY = buyerRect.top - sceneRect.top + buyerRect.height / 2;

      Object.assign(docEl.style, {
        left: `${startX}px`,
        top: `${startY}px`,
        transform: "translate3d(-50%,-50%,0)",
      });

      // trigger unlock immediately before the doc animation
      try {
        const lockEl = lockRef.current;
        if (lockEl) {
          const unlockIcon = lockEl.querySelector(
            ".unlock-icon",
          ) as HTMLElement | null;
          const lockIcon = lockEl.querySelector(
            ".lock-icon",
          ) as HTMLElement | null;

          // show unlock icon, hide locked icon
          unlockIcon?.classList.remove("opacity-0");
          lockIcon?.classList.add("opacity-0");

          // replace classes: remove locked gray, add unlock green
          try {
            lockEl.classList.remove("bg-gray-400", "text-black");
            lockEl.classList.add("bg-emerald-600", "text-white");
          } catch (e) {
            /* ignore */
          }

          // apply inline styles for final appearance immediately (no animation)
          try {
            lockEl.style.backgroundColor = "#10B981";
            lockEl.style.color = "#ffffff";
            // remove any transform so the state is truly instant
            lockEl.style.transform = "";
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      gsap.to(docEl, {
        left: `${endX}px`,
        top: `${endY}px`,
        scale: 1,
        duration: 1.06,
        ease: "power3.inOut",
        onComplete: () => {
          // sound: delivered
          audioRef.current?.playDeliver();

          gsap.fromTo(
            buyerEl,
            { scale: 1 },
            {
              scale: 1.08,
              yoyo: true,
              repeat: 1,
              duration: 0.22,
              ease: "power1.out",
            },
          );

          setTimeout(() => docEl.remove(), 340);
        },
      });
    }
  };

  // External play trigger via `event` prop
  useEffect(() => {
    if (event) {
      // restart from beginning on each event change
      masterRef.current?.restart();
    }
  }, [event]);

  return (
    <div className="w-full max-w-[80rem]">
      <div className="mb-4 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3"></div>
      </div>
      <div
        ref={sceneRef}
        className="relative h-96 md:h-[28rem] w-full overflow-hidden rounded-2xl border border-white/30 bg-black transform-gpu"
      >
        {/* Debug grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
        {/* Center label: Story Network */}
        <div
          ref={storyRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F48906aed3c7344009a10a054f28b82c4%2F14c096d056a0405c8cbbd5daea44fefd?format=webp&width=800"
            alt="Story Network"
            className="h-8 md:h-10 opacity-90 select-none"
            draggable="false"
          />
        </div>

        {/* Inner band border from IPFS to TEE */}
        <div
          className="absolute pointer-events-none rounded-xl border border-white/30"
          style={{
            left: `calc(${positions.ipfs} - 2cm)`,
            width: `calc(${positions.tee} - ${positions.ipfs} + 4cm)`,
            top: "18%",
            bottom: "18%",
          }}
          aria-hidden
        />

        {/* Vault */}
        <div
          ref={vaultRef}
          className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-transparent text-black shadow-[0_0_0_1px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F75857544e65a4f6982333406121c72a7%2Fa9f23897196141cda50bf40c9cf505c4?format=webp&width=800"
            alt="Vault"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Door overlay */}
          <div
            ref={doorRef}
            className="absolute left-0 top-0 h-full bg-black/20"
            style={{ width: "100%" }}
          />
        </div>

        {/* Lock (above vault) */}
        <div
          ref={lockRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow z-50 inline-flex items-center justify-center opacity-0"
        >
          <Unlock className="size-5 unlock-icon transition-opacity" />
          <Lock className="size-5 lock-icon transition-opacity opacity-0 absolute" />
        </div>

        {/* Safe room (TEE) */}
        {mode === "tee" && (
          <div
            ref={teeRef}
            className="absolute transform-gpu"
            style={{
              left: positions.tee,
              top: "26%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="rounded-xl border border-white/10 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 inline-flex items-center gap-1">
              <Cpu className="size-2" /> TEE
            </div>
          </div>
        )}

        {/* Owner */}
        <div
          ref={ownerRef}
          className="absolute transform-gpu"
          style={{
            left: positions.owner,
            top: "62%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div className="size-14 flex items-center justify-center bg-transparent">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F01304b38e2b147e0ab91328119e9a69b%2F0f665063d39347a3804b57e915d4d442?format=webp&width=800"
              alt="IP Owner"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">IP Owner</div>
        </div>

        {/* Buyer */}
        <div
          ref={buyerRef}
          className="absolute transform-gpu"
          style={{
            left: positions.buyer,
            top: "62%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div className="size-14 flex items-center justify-center bg-transparent">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F01304b38e2b147e0ab91328119e9a69b%2Fd69846667a21481caa31c06bb3aa750b?format=webp&width=800"
              alt="Buyer"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-1 text-center text-xs opacity-80">IP Buyer</div>
        </div>

        {/* Document */}
        <div
          ref={docRef}
          role="button"
          style={{
            left: positions.owner,
            top: "44%",
            transform: "translate(-50%,-50%)",
          }}
          onClick={() => {
            try {
              audioRef.current?.playClick();
              performUploadSplit();
            } catch (e) {
              // fallback: show ipfs badge
              gsap.to(ipfsBadgeRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
              });
            }
          }}
          className="absolute transform-gpu cursor-pointer"
        >
          <div className="flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-black shadow">
            <FileText className="size-4" />
            <span className="text-xs font-medium">IP File</span>
          </div>
        </div>

        {/* Badges */}
        <div
          ref={ownerCheckRef}
          className="absolute transform-gpu"
          style={{
            left: positions.ipfs,
            top: "42%",
            transform: "translate(-50%,-100%)",
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-2" /> Ownership OK
          </div>
        </div>

        <div
          ref={licBadgeRef}
          className="absolute transform-gpu"
          style={
            mode === "tee"
              ? { left: positions.tee, top: "36%", transform: "translateX(-50%)" }
              : {
                  left: positions.buyer,
                  top: "46%",
                  transform: "translate(-50%,-100%)",
                }
          }
        >
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200 text-xs">
            <ShieldCheck className="size-2" /> License OK
          </div>
        </div>
        {mode === "tee" && (
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
              <ShieldCheck className="size-2" /> Attestation OK
            </div>
          </div>
        )}
        {/* Conditional Decryption (TEE only) */}
        {mode === "tee" && (
          <div
            ref={condRef}
            className="absolute left-1/2 top-[82%] -translate-x-1/2 transform-gpu"
          >
            <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/90 shadow-sm scale-90">
              <div className="flex flex-wrap gap-1">
                <span
                  data-rule
                  className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5"
                >
                  <EyeOff className="size-2" /> Output-only
                </span>
                <span
                  data-rule
                  className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5"
                >
                  <Scissors className="size-2" /> Partial access
                </span>
                <span
                  data-rule
                  className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5"
                >
                  <Clock className="size-2" /> Time/usage
                </span>
                <span
                  data-rule
                  className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5"
                >
                  <Monitor className="size-2" /> App-restricted
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Access condition badges */}
        <div
          ref={writeCondRef}
          className="absolute transform-gpu"
          style={{ left: "30%", top: "80%", transform: "translateX(-50%)" }}
        ></div>
        <div
          ref={readCondRef}
          className="absolute transform-gpu"
          style={{ left: "70%", top: "80%", transform: "translateX(-50%)" }}
        ></div>

        <div
          ref={ipfsBadgeRef}
          className="absolute transform-gpu"
          style={{
            left: positions.ipfs,
            top: "26%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-md border border-sky-200/40 bg-sky-500/30 px-3 py-1 text-xs text-sky-100">
            <Database className="size-2" />{" "}
            <span className="ipfs-text">IPFS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
