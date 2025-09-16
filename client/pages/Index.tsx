import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FlowStepCard } from "@/components/ip-vault/FlowStepCard";
import { FlowControls } from "@/components/ip-vault/FlowControls";
import { UploadCloud, Lock, Database, KeySquare, BadgeCheck, Shuffle, FileCheck } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: JSX.Element;
}

const STEPS: Step[] = [
  {
    title: "Upload Data",
    description: "Pemilik menyiapkan dan mengunggah konten sensitif (tidak mentah di penyimpanan).",
    icon: <UploadCloud />,
  },
  {
    title: "Encrypt File",
    description: "File dienkripsi (mis. AES-256-GCM) → kunci dibuat secara aman.",
    icon: <Lock />,
  },
  {
    title: "Upload ke Storage",
    description: "File terenkripsi diunggah ke IPFS / Shelby / Arweave untuk availability.",
    icon: <Database />,
  },
  {
    title: "Simpan Kunci di Vault",
    description: "Kunci enkripsi disimpan di IP Vault. Diamankan dengan TEE + MPC oleh validator.",
    icon: <KeySquare />,
  },
  {
    title: "License & Access",
    description: "Saat lisensi onchain aktif, hak akses diberikan otomatis ke Vault.",
    icon: <BadgeCheck />,
  },
  {
    title: "Conditional Decryption",
    description: "Aturan: software tertentu, bagian data, waktu/jumlah, multi-party, atau hanya hasil olahan.",
    icon: <Shuffle />,
  },
  {
    title: "Access File",
    description: "Pengguna sesuai izin mengakses/menjalankan file—hanya hasil yang diizinkan yang bisa diunduh.",
    icon: <FileCheck />,
  },
];

export default function Index() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = window.setInterval(() => {
      setActive((s) => (s + 1) % STEPS.length);
    }, 2200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [playing]);

  const progress = useMemo(() => (active + 1) / STEPS.length, [active]);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <GridBackground />
        </div>
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/30">IP</span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">IP Vault — Cara Kerja (Visual & Animasi)</h1>
            <p className="text-base md:text-lg text-muted-foreground">Animasi sederhana untuk memahami alur: dari upload → enkripsi → kunci disimpan → akses terkontrol.</p>

            <div className="mx-auto max-w-2xl">
              <ProgressBar progress={progress} />
            </div>

            <div className="pt-2">
              <FlowControls
                onPrev={() => setActive((s) => Math.max(0, s - 1))}
                onNext={() => setActive((s) => Math.min(STEPS.length - 1, s + 1))}
                onTogglePlay={() => setPlaying((p) => !p)}
                isPlaying={playing}
                disablePrev={active === 0}
                disableNext={active === STEPS.length - 1}
              />
              <p className="mt-3 text-xs text-muted-foreground">Tip: tekan Play untuk melihat animasi langkah demi langkah</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container py-12 md:py-16">
        {/* Flow line (animated) */}
        <div className="relative mx-auto mb-10 w-full max-w-5xl">
          <motion.svg
            viewBox="0 0 1000 4"
            className="h-1 w-full text-primary"
            initial={false}
          >
            <motion.path
              d="M 0 2 H 1000"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ pathLength: progress }}
              className="opacity-80"
            />
          </motion.svg>
        </div>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <FlowStepCard
              key={i}
              index={i + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              active={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-primary/70 to-primary/40"
        initial={{ width: "0%" }}
        animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_35%)]" />
      <div className="bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    </div>
  );
}
