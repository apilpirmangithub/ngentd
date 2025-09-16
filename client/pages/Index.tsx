import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FlowStepCard } from "@/components/ip-vault/FlowStepCard";
import { FlowControls } from "@/components/ip-vault/FlowControls";
import { AnimatedDiagram } from "@/components/ip-vault/AnimatedDiagram";
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
    <div className="container py-12">
      <TabbedFlow />
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
