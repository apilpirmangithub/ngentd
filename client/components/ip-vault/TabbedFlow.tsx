import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import StoryAnimation from "@/components/ip-vault/StoryAnimation";

function bytesToBase64(buf: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateAesKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function exportKey(key: CryptoKey) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bytesToBase64(raw);
}

async function importKey(b64: string) {
  const raw = base64ToBytes(b64);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export default function TabbedFlow() {
  const [type, setType] = useState<"vault" | "tee">("vault");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);

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
    <section className="bg-black text-white flex flex-col items-center justify-center min-h-[70vh] p-8 space-y-8 rounded-2xl border border-white/10">
      <h1 className="text-3xl font-bold text-center">IP Vault Flow</h1>

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

      <div ref={containerRef} className="w-full space-y-8">
        <StoryAnimation mode={type} />

        <DemoPanel mode={type} />
      </div>
    </section>
  );
}

function DemoPanel({ mode }: { mode: "vault" | "tee" }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [keyB64, setKeyB64] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setStatus(null);
    setCid(null);
    setKeyB64(null);
  };

  const readFileAsArrayBuffer = (file: File) =>
    new Promise<ArrayBuffer>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as ArrayBuffer);
      fr.onerror = () => rej(fr.error);
      fr.readAsArrayBuffer(file);
    });

  const mockUploadToIpfs = async (dataB64: string) => {
    // create a pseudo CID using timestamp + short hash
    const id = "bafkrei" + Math.random().toString(36).slice(2, 9);
    // store encrypted payload in localStorage as mock IPFS
    localStorage.setItem("mock_ipfs_" + id, dataB64);
    return id;
  };

  const onEncryptAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem(
      "file",
    ) as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      setStatus("Pilih file dulu.");
      return;
    }
    setStatus("Membaca file...");
    const data = await readFileAsArrayBuffer(file);
    setStatus("Membuat kunci... (AES-GCM)");
    const key = await generateAesKey();
    const exported = await exportKey(key);
    setKeyB64(exported);
    setStatus("Mengenkripsi...");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    // store iv + ct as base64 (iv first)
    const ivB64 = bytesToBase64(iv.buffer);
    const ctB64 = bytesToBase64(ct);
    const payload = JSON.stringify({ iv: ivB64, ct: ctB64, name: file.name });
    const payloadB64 = btoa(payload);
    setStatus("Mengunggah ke IPFS (mock)...");
    const newCid = await mockUploadToIpfs(payloadB64);
    setCid(newCid);
    setStatus(
      "Selesai: file terenkripsi dan diunggah (mock). Simpan kunci ke Vault untuk akses pembeli.",
    );
  };

  const saveKeyToVault = () => {
    if (!keyB64 || !cid || !fileName) {
      setStatus("Tidak ada kunci atau CID untuk disimpan.");
      return;
    }
    const vault = JSON.parse(localStorage.getItem("ip_vault_keys") || "[]");
    vault.push({
      cid,
      key: keyB64,
      fileName,
      mode,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("ip_vault_keys", JSON.stringify(vault));
    setStatus("Kunci disimpan di Vault (localStorage) dengan stub TEE/MPC.");
  };

  const buyLicenseAndDownload = async () => {
    if (!cid) {
      setStatus("Belum ada file di IPFS (mock).");
      return;
    }
    setStatus("Memeriksa lisensi on-chain (mock)...");
    // simulate on-chain check delay
    await new Promise((r) => setTimeout(r, 800));
    setStatus("Lisensi OK. Mengambil kunci dari Vault (stub)...");
    const vault = JSON.parse(localStorage.getItem("ip_vault_keys") || "[]");
    const rec = vault.find((r: any) => r.cid === cid);
    if (!rec) {
      setStatus("Kunci tidak ditemukan: akses ditolak.");
      return;
    }
    const imported = await importKey(rec.key);
    // fetch mock ipfs payload
    const payloadB64 = localStorage.getItem("mock_ipfs_" + cid);
    if (!payloadB64) {
      setStatus("Payload IPFS mock tidak ditemukan.");
      return;
    }
    const payloadJson = JSON.parse(atob(payloadB64));
    const iv = base64ToBytes(payloadJson.iv);
    const ct = base64ToBytes(payloadJson.ct);
    setStatus("Mendekripsi file...");
    try {
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        imported,
        ct,
      );
      const blob = new Blob([plain]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payloadJson.name || "download.bin";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Berhasil didekripsi dan siap diunduh.");
    } catch (err) {
      setStatus(
        "Gagal mendekripsi: kunci salah atau kondisi akses tidak terpenuhi.",
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg bg-white/5 p-6 border border-white/10">
      <h2 className="text-lg font-semibold">Demo Upload & Vault (Sederhana)</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Demo ringan: enkripsi AES‑GCM di klien, mock upload ke IPFS, simpan
        kunci di Vault (localStorage). Tombol "Beli" akan mencoba mendekripsi
        jika kunci ada.
      </p>

      <form onSubmit={onEncryptAndUpload} className="mt-4 flex flex-col gap-3">
        <input
          name="file"
          type="file"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <div className="flex items-center gap-2">
          <button
            className="rounded bg-blue-600 px-3 py-1 text-white"
            type="submit"
          >
            Encrypt & Upload (mock)
          </button>
          <button
            type="button"
            className="rounded bg-emerald-600 px-3 py-1 text-white"
            onClick={saveKeyToVault}
          >
            Save key to Vault
          </button>
          <button
            type="button"
            className="rounded bg-yellow-600 px-3 py-1 text-black"
            onClick={buyLicenseAndDownload}
          >
            Buy License & Download
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm">
        <div>
          Mode: <strong>{mode}</strong>
        </div>
        <div>
          File: <strong>{fileName || "–"}</strong>
        </div>
        <div>
          CID (mock): <strong>{cid || "–"}</strong>
        </div>
        <div>
          Kunci (base64): <small className="break-all">{keyB64 || "–"}</small>
        </div>
        <div className="mt-2 text-muted-foreground">
          Status: {status || "Idle"}
        </div>
      </div>
    </div>
  );
}
