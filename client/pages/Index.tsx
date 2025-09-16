import { useEffect, useMemo, useRef, useState } from "react";
import TabbedFlow from "@/components/ip-vault/TabbedFlow";

export default function Index() {
  return (
    <div className="container py-12 space-y-12">
      <section
        id="how-it-works"
        className="rounded-2xl border p-6 bg-card text-card-foreground"
      >
        <h2 className="text-xl font-semibold mb-3">Cara Kerja Singkat</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            File/data disimpan terdesentralisasi (mis. IPFS/Shelby), dalam
            keadaan terenkripsi.
          </li>
          <li>Vault hanya menyimpan kunci enkripsi, bukan file.</li>
          <li>Akses kunci dikontrol aturan on-chain (lisensi/kebijakan).</li>
          <li>
            Mode TEE: attestation memverifikasi lingkungan aman sebelum akses.
          </li>
        </ul>
      </section>
      <TabbedFlow />
    </div>
  );
}
