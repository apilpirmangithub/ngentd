"use client";

import { useEffect } from "react";

export default function ExtensionErrorGuard() {
  useEffect(() => {
    const isExtensionError = (err: unknown) => {
      const msg = typeof err === "string" ? err : (err as any)?.message || "";
      const stack = (err as any)?.stack || "";
      return (
        msg.includes("Talisman extension") ||
        msg.includes("chrome-extension://") ||
        stack.includes("chrome-extension://")
      );
    };

    const onError = (event: ErrorEvent) => {
      const filename = (event as any).filename || "";
      if (
        filename.startsWith("chrome-extension://") ||
        isExtensionError(event.error)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isExtensionError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);

  return null;
}
