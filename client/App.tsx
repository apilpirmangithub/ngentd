import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Layout from "@/components/layout/Layout";

const isInIframe = (() => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
const Router = isInIframe ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

// Development-time guard: prevent browser extensions (e.g. FullStory) from causing uncaught fetch errors
if (
  typeof window !== "undefined" &&
  window.fetch &&
  process.env.NODE_ENV === "development"
) {
  try {
    const _origFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo, init?: RequestInit) => {
      try {
        const url =
          typeof input === "string" ? input : (input as Request).url || "";
        if (url && url.includes("fullstory.com")) {
          // avoid proxying extension telemetry requests which can fail in dev
          return Promise.resolve(new Response(null, { status: 204 }));
        }
      } catch (e) {
        /* ignore */
      }
      return _origFetch(input as RequestInfo, init);
    };
  } catch (e) {
    /* ignore */
  }
}

createRoot(document.getElementById("root")!).render(<App />);
