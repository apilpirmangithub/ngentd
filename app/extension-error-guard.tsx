"use client";

import { useEffect } from "react";

export default function ExtensionErrorGuard() {
  useEffect(() => {
    const isBenignNoise = (err: unknown) => {
      const msg = typeof err === "string" ? err : (err as any)?.message || "";
      const stack = (err as any)?.stack || "";
      return (
        msg.includes("Talisman extension") ||
        msg.includes("chrome-extension://") ||
        stack.includes("chrome-extension://") ||
        msg.toLowerCase().includes("origins don't match") ||
        msg.toLowerCase().includes("failed to execute 'postmessage'")
      );
    };

    const onError = (event: ErrorEvent) => {
      const filename = (event as any).filename || "";
      if (filename.startsWith("chrome-extension://") || isBenignNoise(event.error)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isBenignNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    // filter noisy console errors from cross-origin previews
    const origError = console.error;
    const origWarn = console.warn;
    const shouldSilenceConsole = (...args: unknown[]) => {
      try {
        return args.some((a) =>
          String(a).toLowerCase().includes("origins don't match") ||
          String(a).toLowerCase().includes("failed to execute 'postmessage'")
        );
      } catch {
        return false;
      }
    };
    console.error = (...args: any[]) => {
      if (shouldSilenceConsole(...args)) return;
      return origError.apply(console, args as any);
    };
    console.warn = (...args: any[]) => {
      if (shouldSilenceConsole(...args)) return;
      return origWarn.apply(console, args as any);
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    return () => {
      console.error = origError;
      console.warn = origWarn;
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);

  return null;
}
