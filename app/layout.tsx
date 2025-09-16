import type { Metadata } from "next";
import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import Providers from "./providers";
import ExtensionErrorGuard from "./extension-error-guard";
import Script from "next/script";
import "../client/global.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "IP Vault — Cara Kerja",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-dvh flex flex-col">
        <Script id="ext-guard" strategy="beforeInteractive">
          {`
            (function(){
              function isExtErr(e){
                try{var m=(e&&e.message)||e||'';var s=(e&&e.stack)||'';return m.includes('Talisman extension')||m.includes('chrome-extension://')||s.includes('chrome-extension://');}catch{return false}}
              function onErr(ev){var f=ev && ev.filename || ''; if((f && f.indexOf('chrome-extension://')===0) || isExtErr(ev.error)){ev.preventDefault&&ev.preventDefault(); ev.stopImmediatePropagation&&ev.stopImmediatePropagation();}}
              function onRej(ev){ if(isExtErr(ev && ev.reason)){ev.preventDefault&&ev.preventDefault(); ev.stopImmediatePropagation&&ev.stopImmediatePropagation();}}
              window.addEventListener('error', onErr, true);
              window.addEventListener('unhandledrejection', onRej, true);
            })();
          `}
        </Script>
        <Header />
        <ExtensionErrorGuard />
        <main className="flex-1">
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60",
        "bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="relative flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:ring-primary/40 transition">
            <Lock className="size-4" />
            <span className="pointer-events-none absolute inset-0 rounded-md ring-4 ring-primary/0 group-hover:ring-primary/10 transition" />
          </span>
          <span className="font-semibold tracking-tight">IP Vault</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
            Cara Kerja
          </a>
          <a href="#walkthrough" className="text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2">
            <PlayCircle className="size-4" /> Walkthrough
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container py-8 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} IP Vault. Semua hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-foreground transition">
              Cara Kerja
            </a>
            <a href="#walkthrough" className="hover:text-foreground transition">
              Walkthrough
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
