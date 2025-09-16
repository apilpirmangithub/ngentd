import { Link, NavLink, Outlet } from "react-router-dom";
import { Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b border-border/60",
      "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    )}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group inline-flex items-center gap-2">
          <span className="relative flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:ring-primary/40 transition">
            <Lock className="size-4" />
            <span className="pointer-events-none absolute inset-0 rounded-md ring-4 ring-primary/0 group-hover:ring-primary/10 transition" />
          </span>
          <span className="font-semibold tracking-tight">IP Vault</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">Cara Kerja</a>
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
            <a href="#how-it-works" className="hover:text-foreground transition">Cara Kerja</a>
            <a href="#walkthrough" className="hover:text-foreground transition">Walkthrough</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
